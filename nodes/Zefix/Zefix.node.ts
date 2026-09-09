import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

import { companyFields, companyOperations } from './descriptions/CompanyDescription';
import { parseUid } from './helpers/uid';
import {
	getCompanyByEhraid,
	getCompanyByUid,
	getLegalForms,
	requireZefixCredentials,
	searchCompanies,
} from './transport/zefix';
import type { ZefixCompany, ZefixSearchBody } from './transport/zefix';

/** The Lookup output. `purpose` and `sogcPub` ride along untouched. */
function companyRow(company: ZefixCompany): IDataObject {
	// Zefix stores the compact form while the gazette prints the dotted one.
	// Both are emitted so a workflow can join against either.
	const uid = parseUid(company.uid ?? '');

	return {
		name: company.name,
		uid: uid?.dotted ?? company.uid,
		uidCompact: uid?.compact ?? company.uid,
		ehraid: company.ehraid,
		chid: company.chid,
		canton: company.canton ?? null,
		legalSeat: company.legalSeat,
		legalSeatId: company.legalSeatId,
		legalFormId: company.legalForm?.id ?? null,
		legalFormUid: company.legalForm?.uid ?? null,
		legalForm: company.legalForm ?? null,
		status: company.status,
		purpose: company.purpose ?? null,
		capitalNominal: company.capitalNominal ?? null,
		capitalCurrency: company.capitalCurrency ?? null,
		deletionDate: company.deletionDate,
		sogcDate: company.sogcDate ?? null,
		address: company.address ?? null,
		translation: company.translation ?? [],
		oldNames: company.oldNames ?? [],
		headOffices: company.headOffices ?? [],
		furtherHeadOffices: company.furtherHeadOffices ?? [],
		branchOffices: company.branchOffices ?? [],
		hasTakenOver: company.hasTakenOver ?? [],
		wasTakenOverBy: company.wasTakenOverBy ?? [],
		auditCompanies: company.auditCompanies ?? [],
		registryOfCommerceId: company.registryOfCommerceId,
		cantonalExcerptWeb: company.cantonalExcerptWeb ?? null,
		zefixDetailWeb: company.zefixDetailWeb ?? null,
	};
}

export class Zefix implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zefix',
		name: 'zefix',
		icon: { light: 'file:zefix.svg', dark: 'file:zefix.dark.svg' },
		group: ['input'],
		version: [1],
		subtitle: '={{ $parameter["operation"] + ": " + $parameter["resource"] }}',
		description: 'Read the Swiss commercial register',
		defaults: { name: 'Zefix' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				// Every Zefix PublicREST endpoint refuses an unauthenticated call.
				name: 'zefixApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [{ name: 'Company', value: 'company' }],
				default: 'company',
			},
			...companyOperations,
			...companyFields,
		],
	};

	methods = {
		loadOptions: {
			async getLegalForms(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				await requireZefixCredentials(this, 'The legal-form list');
				const forms = await getLegalForms(this);
				return forms
					.filter((form) => form.id !== 0)
					.map((form) => ({
						name: form.name?.en ?? form.name?.de ?? form.uid,
						value: form.id,
					}));
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returned: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const resource = this.getNodeParameter('resource', i) as string;
				const operation = this.getNodeParameter('operation', i) as string;

				if (resource === 'company' && operation === 'lookup') {
					await requireZefixCredentials(this, 'Company lookup');

					const lookupBy = this.getNodeParameter('lookupBy', i) as string;
					const company =
						lookupBy === 'uid'
							? await getCompanyByUid(this, this.getNodeParameter('uid', i) as string)
							: await getCompanyByEhraid(this, this.getNodeParameter('ehraid', i) as number);

					// No such company. An outage throws instead, from the transport.
					if (company === null) {
						this.addExecutionHints({
							message:
								lookupBy === 'uid'
									? `${this.getNodeParameter('uid', i) as string} has no commercial register entry. Zefix covers the register only: a UID issued for VAT alone, an association or a public body is valid at uid.admin.ch and still absent here.`
									: `EHRA ID ${this.getNodeParameter('ehraid', i) as number} is not in the commercial register.`,
							location: 'outputPane',
						});
					}

					returned.push({ json: company === null ? {} : companyRow(company), pairedItem: i });
					continue;
				}

				if (resource === 'company' && operation === 'search') {
					await requireZefixCredentials(this, 'Company search');

					const options = this.getNodeParameter('searchOptions', i, {}) as IDataObject;
					const limit = this.getNodeParameter('limit', i) as number;

					const body: ZefixSearchBody = { name: this.getNodeParameter('name', i) as string };
					if (options.activeOnly !== undefined) body.activeOnly = options.activeOnly as boolean;
					if (options.canton) body.canton = options.canton as string;
					if (options.legalFormId) body.legalFormId = Number(options.legalFormId);
					if (options.legalSeatId) body.legalSeatId = Number(options.legalSeatId);
					if (options.registryOfCommerceId) {
						body.registryOfCommerceId = Number(options.registryOfCommerceId);
					}

					// The endpoint is not paginated, so the limit is applied here.
					const results = await searchCompanies(this, body);
					for (const company of results.slice(0, limit)) {
						const uid = parseUid(company.uid ?? '');
						returned.push({
							json: {
								...(company as IDataObject),
								uid: uid?.dotted ?? company.uid,
								uidCompact: uid?.compact ?? company.uid,
							},
							pairedItem: i,
						});
					}
					continue;
				}

				throw new NodeOperationError(
					this.getNode(),
					`Unknown operation "${operation}" on resource "${resource}"`,
					{ itemIndex: i },
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returned.push({ json: { error: (error as Error).message }, pairedItem: i });
					continue;
				}
				// The transport layer already raises NodeApiError and NodeOperationError.
				// Either constructor hands back an instance of its own class untouched,
				// so the item index is stamped first and the wrap below only rebuilds
				// errors that arrive raw.
				if (error instanceof NodeApiError || error instanceof NodeOperationError) {
					error.context.itemIndex = i;
				}
				if (error instanceof NodeApiError) {
					throw new NodeApiError(this.getNode(), error as unknown as JsonObject);
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex: i });
			}
		}

		return [returned];
	}
}
