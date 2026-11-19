/* Enterprise AI Security, Governance & Cloud Adoption Framework (CAF) Landing Zones */
window.ATLAS.governance = {
  landingZones: {
    title: 'Enterprise AI Landing Zones & Cloud Adoption Framework',
    intro: 'Microsoft\'s Cloud Adoption Framework (CAF) recommends extending existing enterprise Azure landing zones rather than creating an isolated AI silo. An AI workload relies on enterprise identity, network connectivity, centralized logging and policy guardrails.',
    principles: [
      {
        name: 'Extend, Do Not Fork, Landing Zones',
        desc: 'Incorporate AI platform resources into established management group hierarchies and hub-and-spoke virtual networks. AI is an application workload, not an alternative cloud platform.'
      },
      {
        name: 'Shared Platform vs Workload Subscriptions',
        desc: 'Separate central shared platform services (API gateways, foundational models, container registries) from decentralized application workload subscriptions (feature development, prompt engineering).'
      },
      {
        name: 'Zero Trust Network Architecture',
        desc: 'No public IPs or endpoints on AI services. Enforce private endpoints, user-defined routing through Azure Firewall, and private DNS resolution.'
      },
      {
        name: 'Policy-Driven Governance',
        desc: 'Enforce security controls programmatically via Azure Policy initiatives rather than manual review gates.'
      }
    ],
    hierarchy: [
      {
        level: 'Tenant Root Group',
        scope: 'Enterprise Root',
        purpose: 'Defines global compliance policies, root RBAC assignments, and core billing accounts.'
      },
      {
        level: 'Platform Management Group',
        scope: 'Management · Connectivity · Identity',
        purpose: 'Hosts central hub virtual networks, Azure Firewall, Log Analytics workspaces, Azure Managed Grafana, and Azure DNS Private Resolvers.'
      },
      {
        level: 'AI Platform / Shared Services Subscriptions',
        scope: 'Foundry Hubs · Shared Model PTUs · APIM Gateway',
        purpose: 'Hosts enterprise AI gateways ([[apim]]), shared provisioned model capacity (PTUs), centralized container registries ([[acr]]), and enterprise knowledge bases in [[ai-search]].'
      },
      {
        level: 'Workload Management Group',
        scope: 'Business Units & Application Teams',
        purpose: 'Subdivided into Development, Staging, and Production workload subscriptions. Each team receives isolated resource groups for prompt testing, agent development, and RAG experimentation.'
      },
      {
        level: 'Sandbox Management Group',
        scope: 'Isolated R&D',
        purpose: 'Strictly budgeted, network-isolated environments for rapid model prototyping with automated monthly spend caps and auto-destruction policies.'
      }
    ],
    networkTopology: {
      type: 'Hub-and-Spoke with Azure Virtual WAN',
      components: [
        { name: 'Hub VNet', desc: 'Hosts [[azure-firewall|Azure Firewall]], Application Gateway with WAF v2, VPN/ExpressRoute gateways, and Azure DNS Private Resolver.' },
        { name: 'AI Spoke VNets', desc: 'Isolated spoke VNets for AI workloads (AKS model clusters, Container Apps agent runtimes, Azure ML compute pools).' },
        { name: 'Private Endpoints', desc: 'Every PaaS resource (Foundry, Azure OpenAI, AI Search, Blob, Cosmos DB, Key Vault) projects a private IP into dedicated subnets.' },
        { name: 'User-Defined Routes (UDR)', desc: 'Force all spoke outbound traffic (`0.0.0.0/0`) through Azure Firewall for FQDN filtering and exfiltration prevention.' }
      ]
    }
  },

  securityFramework: {
    title: 'Enterprise AI Security Framework',
    intro: 'A defense-in-depth model mapping security controls across every layer of the generative AI stack, grounded in the Microsoft Cloud Security Benchmark (MCSB) for AI.',
    pillars: [
      {
        id: 'identity',
        name: '1. Identity & Access Management',
        controls: [
          '**Disable Local Key Authentication:** Enforce `disableLocalAuth=true` on all Foundry, OpenAI, Search, and Storage resources.',
          '**Managed Identities:** Workloads authenticate between services (e.g. APIM -> Foundry Models, Container Apps -> Azure AI Search) using system-assigned or user-assigned managed identities.',
          '**Workload Identity Federation:** CI/CD pipelines (GitHub Actions, Azure DevOps) authenticate to Azure via OpenID Connect (OIDC) without long-lived client secrets.',
          '**Delegated User Authorization:** Propagate end-user Entra ID OAuth2 tokens (On-Behalf-Of flow) so agent tools and RAG retrieval act with user permissions, not administrative privileges.'
        ]
      },
      {
        id: 'authorization',
        name: '2. Fine-Grained RBAC & Tool Permissions',
        controls: [
          '**Least-Privilege Roles:** Assign built-in granular roles: `Cognitive Services OpenAI User` (inference only) vs `Cognitive Services OpenAI Contributor` (model deployer).',
          '**Tool-Level Permission Boundaries:** Agent tools hosted as Azure Functions must validate JWT bearer tokens and check caller security scopes before executing business actions.',
          '**Server-Side Parameter Validation:** Tools must strictly validate argument schemas server-side to prevent parameter tampering or prompt-induced SQL injection.'
        ]
      },
      {
        id: 'data',
        name: '3. Data Security & Cryptography',
        controls: [
          '**Customer-Managed Keys (CMK):** Encrypt data at rest in Blob Storage, Azure Cosmos DB, and Azure AI Search with customer-managed keys held in Azure Key Vault Premium or Managed HSM.',
          '**Zero Customer Data Retention (ZCDR):** Contractually enable ZCDR with Microsoft to ensure prompts and completions are never logged or reviewed by human evaluators.',
          '**Automated PII Masking:** Use Azure AI Language PII detection to redact sensitive personal, healthcare, or financial identifiers before prompts enter model context.'
        ]
      },
      {
        id: 'rag-security',
        name: '4. Document-Level Security in RAG',
        controls: [
          '**Security Trimming:** Tag chunks in Azure AI Search with Entra ID user and group security identifiers (SIDs).',
          '**Mandatory Server-Side Filter Injection:** Inject OData security filters (`permissions/any(g: search.in(g, userGroups))`) at the gateway layer. Never trust frontend filters.',
          '**Pre-Signed User-Delegated SAS Tokens:** Serve raw document downloads using short-lived (5-minute) user-delegated SAS tokens verified against the user\'s storage RBAC.'
        ]
      },
      {
        id: 'agent-security',
        name: '5. Agentic Security & Autonomy Controls',
        controls: [
          '**Human-in-the-Loop (HITL) Approval Gates:** Mandate human authorization (via Teams or email) for all external writes, financial transactions, or customer-facing notifications.',
          '**Container Sandboxing:** Execute dynamic Python code generated by models inside ephemeral, network-isolated sandboxes with restricted disk and CPU limits.',
          '**Hard Iteration & Budget Caps:** Enforce hard stops (max 5 tool turns, 60s timeout, 10,000 tokens) per agent task to prevent infinite loops.'
        ]
      },
      {
        id: 'prompt-security',
        name: '6. Prompt Security & Guardrails',
        controls: [
          '**Azure AI Content Safety Prompt Shields:** Screen incoming prompts for direct jailbreak attempts and system prompt extraction attacks.',
          '**Indirect Injection Defenses:** Screen untrusted retrieved documents and tool outputs for embedded instructions designed to hijack agent reasoning.',
          '**Delimited System Prompts:** Isolate external content inside unambiguous XML/Markdown delimiters (`<untrusted_context>`) with explicit model instructions to ignore instructions inside tags.'
        ]
      },
      {
        id: 'network',
        name: '7. Network Security & Perimeter Defense',
        controls: [
          '**Private Endpoints:** Expose all PaaS services exclusively on private IP addresses within virtual networks.',
          '**Outbound Egress Whitelisting:** Enforce FQDN filtering via Azure Firewall to prevent compromised agents or models from transmitting data to external endpoints.',
          '**Layer 7 WAF:** Front user-facing web applications with Azure Application Gateway or Azure Front Door WAF rules blocking OWASP Top 10 vulnerabilities.'
        ]
      },
      {
        id: 'governance',
        name: '8. AI Red Teaming & Continuous Governance',
        controls: [
          '**Continuous Adversarial Testing:** Conduct automated red-teaming sweeps simulating jailbreaks, data exfiltration, and prompt injection before every production release.',
          '**Immutable Audit Trails:** Record every model call, prompt hash, tool execution, and approval event to an immutable Log Analytics workspace.',
          '**Responsible AI Verification:** Review AI capabilities against fairness, transparency, and accountability checklists before production sign-off.'
        ]
      }
    ]
  },

  tenancyModels: {
    title: 'Enterprise Multi-Tenancy Architecture Patterns',
    models: [
      {
        name: 'Pooled / Shared Index (Logical Isolation)',
        fit: 'Standard B2B SaaS with hundreds or thousands of low-to-medium risk customers.',
        mechanism: 'Single [[ai-search]] index; documents carry `tenantId` metadata; gateway injects mandatory search filters.',
        pros: 'Lowest infrastructure cost; instant tenant onboarding; scales to millions of documents.',
        cons: 'Logical isolation only; bugs in filter injection could leak data across tenants; shared noisy-neighbor capacity.'
      },
      {
        name: 'Index-per-Tenant (Isolated Index)',
        fit: 'Moderate tenant counts (50-500) requiring custom schemas or fast one-click tenant deletion.',
        mechanism: 'Dedicated search index per customer inside a shared Azure AI Search service.',
        pros: 'Strong logical separation; distinct schemas per customer; easy tenant deletion and data export.',
        cons: 'Bounded by search tier index limits (50 on S1, 200 on S2); cost accumulates across many tiers.'
      },
      {
        name: 'Service-per-Tenant (Physical Isolation)',
        fit: 'Regulated enterprise tiers, government clients, or contracts mandating dedicated compute.',
        mechanism: 'Dedicated [[ai-search]] service and dedicated storage account in a dedicated resource group per tenant.',
        pros: 'Complete physical isolation; customer-managed encryption keys per tenant; zero noisy-neighbor interference.',
        cons: 'Highest cost ($250 - $2,000+/mo per tenant); high operational overhead to provision and upgrade.'
      }
    ]
  },

  policyInitiatives: {
    title: 'Recommended Azure Policy Initiatives for AI',
    policies: [
      { name: 'Deny Public Network Access on Cognitive Services', effect: 'Deny', purpose: 'Ensures no developer can create an Azure OpenAI or Foundry resource with public internet endpoints.' },
      { name: 'Require Customer-Managed Keys (CMK) on AI Storage', effect: 'Deny', purpose: 'Guarantees that all document storage accounts and search indexes are encrypted using Key Vault keys.' },
      { name: 'Restrict Approved Model Deployments', effect: 'Audit / Deny', purpose: 'Restricts model deployments in Foundry to an approved corporate catalog (e.g. GPT-4o, GPT-4o-mini, text-embedding-3).' },
      { name: 'Enforce Mandatory Cost Center & Owner Tags', effect: 'Deny', purpose: 'Blocks resource creation if mandatory resource attribution tags (`costCenter`, `owner`, `environment`) are missing.' },
      { name: 'Enforce Diagnostic Logging to Central Workspace', effect: 'DeployIfNotExists', purpose: 'Automatically configures diagnostic settings to stream all audit, request, and security logs to the central Log Analytics workspace.' }
    ]
  }
};
window.ATLAS.governance.policyInitiative = window.ATLAS.governance.policyInitiatives;
