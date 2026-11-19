/* Security & Identity */
S({
  id: 'entra-id', cat: 'security', name: 'Microsoft Entra ID & managed identities', doc: 'entra/identity/',
  tag: 'Identity for people, apps and agents: roles instead of keys, tokens instead of secrets.',
  what: 'Microsoft Entra ID is Azure\'s identity platform. People sign in with it; applications and services use **managed identities** (credentials Azure issues and rotates, with nothing to store) or app registrations; Azure access is governed by **role-based access control (RBAC)** at subscription, resource group and resource scope. Services such as Foundry, AI Search, Blob and Cosmos DB accept Entra tokens, so you can **turn keys off** entirely.\n\nFor agents, identity decides the blast radius: which data a tool can read and which actions it may take. Patterns such as **on-behalf-of** flows let a tool act as the signed-in user, and agent-specific identities give each agent its own auditable principal.',
  flow: ['Caller (user / app / agent)', 'Token request', 'Entra ID', 'Token + claims', 'Service checks RBAC', 'Access granted or denied'],
  steps: [
    [0, 'A user signs in, or an app asks for a token using its managed identity.'],
    [1, 'The request names a **resource** (for example `https://cognitiveservices.azure.com/.default`) and, for users, may pass through Conditional Access.'],
    [2, 'Entra ID authenticates the caller and evaluates policies such as device compliance and sign-in risk.'],
    [3, 'It issues a short-lived **token** with the caller\'s identity and group or role claims.'],
    [4, 'The target service validates the token and checks **RBAC assignments** (for example "Cognitive Services OpenAI User" or "Search Index Data Reader").'],
    [5, 'Access is allowed or denied, and the sign-in and role use is logged for audit.']
  ],
  gotchas: [
    '**Control plane and data plane roles differ.** "Contributor" on a resource does not grant data access; assign data roles explicitly.',
    '**Role assignments take minutes to propagate.** A freshly granted role failing for a while is normal; do not "fix" it by reverting.',
    '**Keys bypass everything.** Disable local (key) authentication on services that support it, or the identity model is optional.',
    '**Shared identities hide users.** An agent that always acts as one service identity can read data the asking user cannot. Use on-behalf-of or per-user filters.',
    '**Over-broad scope.** Assigning roles at subscription level for convenience is how a leaked token becomes an incident.'
  ],
  edges: [
    '**User-assigned managed identities** can be shared across resources; **system-assigned** are tied to one resource and its lifecycle.',
    '**Privileged Identity Management** gives time-limited, approved elevation for sensitive roles.',
    '**Workload identity federation** lets external systems (such as GitHub Actions) get tokens without stored secrets.'
  ],
  ml: [
    'Keyless access from apps and agents to models, search, storage and databases.',
    'Per-user data access in RAG and agents through delegated tokens and ACL-based filters.',
    'Separate identities for training, deployment and operations, so no single credential can do all three.',
    'Audit trail of which identity called which model or tool.'
  ],
  pairs: ['key-vault', 'foundry', 'ai-search', 'foundry-agent-service', 'azure-policy', 'defender'],
  cost: 'Core Entra features come with Azure subscriptions; advanced capabilities (Conditional Access, PIM, identity protection) need paid Entra licences. Managed identities themselves are free.'
});

S({
  id: 'key-vault', cat: 'security', name: 'Azure Key Vault', doc: 'azure/key-vault/',
  tag: 'Store secrets, keys and certificates, and hold the customer-managed keys that encrypt your data.',
  what: 'Key Vault stores **secrets** (connection strings, third-party API keys), **keys** (for encryption and signing) and **certificates**, with access controlled by RBAC and every access logged. Hardware-backed options exist for stricter needs (**Managed HSM**).\n\nIn AI systems it has two jobs. First, it holds the secrets you cannot avoid, such as a partner API key used by a tool. Second, it holds **customer-managed keys (CMK)** that encrypt data in services like Storage, Cosmos DB, AI Search and Foundry, which many regulated-data reviews expect. The best secret is the one you do not store: prefer managed identities and keep Key Vault for what remains.',
  flow: ['App / service', 'Managed identity token', 'Key Vault (RBAC)', 'Secret or key operation', 'Audit log', 'Rotation'],
  steps: [
    [0, 'An app needs a secret or a key operation.'],
    [1, 'It gets a token with its managed identity ([[entra-id]]), without any stored credential.'],
    [2, 'Key Vault checks the identity\'s **RBAC role** on the vault or object.'],
    [3, 'It returns the secret, or performs the cryptographic operation (wrap, unwrap, sign) without exposing the key.'],
    [4, 'The access is written to diagnostic logs sent to [[azure-monitor]].'],
    [5, 'Secrets and keys are rotated on a schedule, with services picking up new versions.']
  ],
  gotchas: [
    '**CMK dependence is a risk.** If a key is disabled, deleted or its vault is inaccessible, the encrypted service stops working. Enable **soft delete** and **purge protection**, and monitor access.',
    '**Throttling exists.** Fetching a secret on every request will be throttled; cache in memory with a sensible lifetime.',
    '**Use the RBAC permission model**, not legacy access policies, for consistent control and audit.',
    '**One vault per environment and sensitivity.** A shared vault gives broad blast radius.',
    '**Secrets in code, pipelines or logs** defeat the purpose; scan for them.'
  ],
  edges: [
    'Key Vault references let App Service, Functions and Container Apps read secrets as settings without code changes.',
    'Automatic key rotation can create a new key version on a schedule, but each service must support version updates.',
    'Cross-Region and cross-tenant CMK scenarios have extra setup and failure modes.'
  ],
  ml: [
    'Customer-managed keys for storage, databases, search indexes and model workspaces.',
    'Holding credentials for external systems that agent tools must call.',
    'Signing and verifying model artifacts in a supply-chain-controlled pipeline.',
    'Replacing keys with identities wherever the target supports Entra tokens.'
  ],
  pairs: ['entra-id', 'blob', 'cosmos', 'ai-search', 'aml-workspace', 'azure-policy'],
  cost: 'Billed per 10,000 operations, with extra charges for premium (HSM-backed) keys and Managed HSM pools per hour. Costs are low unless secrets are fetched on every request.'
});

S({
  id: 'defender', cat: 'security', name: 'Microsoft Defender for Cloud', doc: 'azure/defender-for-cloud/',
  tag: 'Posture management and threat detection, including for AI workloads and models.',
  what: 'Defender for Cloud assesses the **security posture** of your Azure resources (misconfigurations, exposed endpoints, missing encryption) and detects **threats** at runtime. For AI, it adds **AI security posture management** that discovers generative-AI workloads and shows attack paths, and **threat protection for AI services** that raises alerts on suspicious use of model deployments, such as jailbreak attempts, data-exfiltration patterns and credential misuse.\n\nIt does not replace design-time controls like least privilege and private networking; it tells you where you drifted from them and when something odd is happening.',
  flow: ['Resources discovered', 'Posture assessment', 'Recommendations', 'Runtime detection', 'Alerts', 'Response'],
  steps: [
    [0, 'Defender discovers resources in your subscriptions, including [[foundry|Foundry]] resources, models and agents.'],
    [1, 'It evaluates configuration against security benchmarks and your [[azure-policy|policies]].'],
    [2, 'It lists **recommendations** ranked by risk, such as public network access enabled or keys not rotated.'],
    [3, 'For protected AI services it monitors prompts and responses for attack signals, using content-safety signals, without storing the content for you.'],
    [4, 'Suspicious activity creates **alerts** with context (caller, IP, deployment) in the Defender portal and SIEM.'],
    [5, 'Your team triages, blocks the caller or rotates credentials, and closes the recommendation.']
  ],
  gotchas: [
    '**Plans are enabled per resource type and cost money.** Turn on AI threat protection deliberately for production, not everywhere by default.',
    '**Alerts are only as good as triage.** Without an owner and a runbook, alerts pile up.',
    '**Recommendations are not all equal.** Use risk-based prioritisation, or you will fix low-value items first.',
    '**Coverage depends on configuration.** Features need diagnostic settings and, for AI alerts, enablement on the service.',
    '**Posture findings do not prove safety.** A clean score does not cover prompt injection in your own application logic.'
  ],
  edges: [
    'Alerts can stream to Microsoft Sentinel or another SIEM for correlation with identity and network signals.',
    'Attack-path analysis highlights chains such as "internet-exposed app with a path to a model with sensitive data".',
    'Regulatory-compliance dashboards map controls to standards.'
  ],
  ml: [
    'Continuous posture checks for model endpoints, storage and search used by AI apps.',
    'Detection of jailbreak and abuse attempts against production deployments.',
    'Evidence for security reviews that AI services follow your baseline.',
    'Alert routing to the same on-call as the application team.'
  ],
  pairs: ['content-safety', 'foundry', 'azure-policy', 'entra-id', 'azure-monitor'],
  cost: 'Billed per protected resource per month or per usage depending on the plan (for AI services, typically by tokens processed or per resource). Enable on production first and review the price for your volume.'
});

S({
  id: 'azure-policy', cat: 'security', name: 'Azure Policy & governance', doc: 'azure/governance/policy/',
  tag: 'Guardrails for the platform itself: where resources may live, how they must be configured.',
  what: 'Azure Policy evaluates resources against rules and can **audit**, **deny**, **modify** or **deploy missing settings**. Assigned at a **management group**, subscription or resource group, it enforces your baseline across every team: allowed Regions, mandatory tags, no public network access, customer-managed keys required, diagnostic logging on, and, for AI, rules about what AI resources and model deployments are permitted.\n\nIt is how a platform team turns "please do this" into "the platform won\'t let you do otherwise", and how an engineering leader gets evidence that every AI resource follows the standard.',
  flow: ['Policy definition', 'Initiative (bundle)', 'Assignment at scope', 'Evaluation', 'Deny / audit / remediate', 'Compliance report'],
  steps: [
    [0, 'You write or pick **policy definitions**: a condition and an effect.'],
    [1, 'You group them into an **initiative** that represents a standard, such as "AI workload baseline".'],
    [2, 'You **assign** it at a management group or subscription, with parameters and exclusions.'],
    [3, 'When a resource is created or changed, Azure evaluates it, and re-evaluates existing resources on a schedule.'],
    [4, 'The effect applies: **deny** blocks, **audit** flags, **modify** and **deployIfNotExists** fix or add settings via remediation.'],
    [5, 'The compliance dashboard shows non-compliant resources and trends, and feeds [[defender|Defender for Cloud]].']
  ],
  gotchas: [
    '**Deny breaks pipelines.** A new deny rule can suddenly fail deployments. Roll out as audit first, announce, then enforce.',
    '**Policy does not look inside your application.** It controls resource configuration, not what an agent does with its permissions.',
    '**Exemptions are debt.** Every exception needs an owner and an expiry.',
    '**Built-in AI policies change.** Check what exists for the services you use and review them as services evolve.',
    '**Effects on existing resources need remediation.** Assigning a policy does not fix what is already deployed.'
  ],
  edges: [
    'Policy as code (definitions in Git, deployed with [[bicep|Bicep]] or pipelines) gives review and history.',
    'Initiatives can map to regulatory frameworks, which helps audit conversations.',
    'Management-group hierarchy lets you apply stricter rules to a "regulated" group of subscriptions.'
  ],
  ml: [
    'Require private endpoints, disabled key auth and diagnostic logs on every AI resource.',
    'Restrict deployments to approved Regions and, where supported, approved models.',
    'Enforce tagging so cost and ownership are always known.',
    'Provide audit evidence for governance reviews.'
  ],
  pairs: ['defender', 'bicep', 'private-link', 'key-vault', 'cost-management', 'purview'],
  cost: 'Azure Policy itself is free; costs come from the resources it requires (such as private endpoints and logging) and from remediation deployments.'
});
