/* Networking & Delivery */
S({
  id: 'apim', cat: 'networking', name: 'Azure API Management (AI gateway)', doc: 'azure/api-management/',
  tag: 'The front door for model traffic: auth, token limits, load balancing, caching and metrics.',
  what: 'API Management (APIM) is a managed API gateway. Placed in front of model deployments, it becomes an **AI gateway**: one place to authenticate callers, enforce **token-based rate limits** per application or tenant, **load-balance across several deployments or Regions**, add a **circuit breaker** when a backend throttles, emit **token metrics** for chargeback, and optionally use a **semantic cache**.\n\nIt can also expose existing REST APIs as **MCP servers** so agents can call enterprise tools through one governed entry point. For platform teams serving many product teams from shared model capacity, it is the control point that makes sharing safe.',
  flow: ['Client app', 'APIM (auth + policy)', 'Token limit + cache', 'Backend pool (model deployments)', 'Model', 'Metrics'],
  steps: [
    [0, 'A client calls the gateway with its own credential (an Entra token or a subscription key), not the model\'s key.'],
    [1, 'APIM validates the caller and applies inbound **policies**: identity checks, request shaping, content-safety checks.'],
    [2, 'A **token-limit policy** counts tokens per caller and returns HTTP 429 when the budget is spent; a semantic cache may answer repeats.'],
    [3, 'A **backend pool** picks a deployment by priority or weight; the circuit breaker removes a throttling backend for a cool-down.'],
    [4, 'APIM authenticates to the model with its **managed identity** and streams the response back.'],
    [5, 'Token usage and latency are emitted per caller to [[azure-monitor]], enabling chargeback and anomaly alerts.']
  ],
  gotchas: [
    '**Streaming needs care.** Policies that buffer the response break server-sent events. Keep streaming paths free of buffering policies and test time to first token.',
    '**Token counting for streams is approximate.** Pre-checks estimate prompt tokens; rely on returned usage where available, and leave headroom.',
    '**The gateway can become the bottleneck.** Size the tier and units for peak, and check each tier\'s limits and networking features.',
    '**Timeouts stack.** The gateway, front door and model each have limits; the shortest wins.',
    '**One identity to the model hides the end user.** Pass a caller identity in headers and log it, or you lose attribution.'
  ],
  edges: [
    'Load balancing across Regions helps with throughput but can move data across geographies; align with residency rules.',
    'Products and subscriptions let you give each team its own key, quota and analytics.',
    'Self-hosted gateways can bring the same policies on-premises or to other clouds.'
  ],
  ml: [
    'Central AI gateway: per-team token budgets, shared capacity, one place for safety and logging.',
    'Resilience: spread traffic over several deployments and fall back when one throttles.',
    'Chargeback: tokens per application and tenant from gateway metrics.',
    'Publishing tools to agents through MCP with consistent authentication.'
  ],
  pairs: ['foundry-models', 'foundry-agent-service', 'front-door', 'redis', 'azure-monitor', 'entra-id'],
  cost: 'Billed per hour by tier and units (a v2 tier is typical today) plus per-call charges on consumption tiers. The gateway is small next to token cost, and often pays for itself by preventing a single runaway client.'
});

S({
  id: 'front-door', cat: 'networking', name: 'Azure Front Door', doc: 'azure/frontdoor/',
  tag: 'Global entry point with edge routing, WAF and acceleration for user-facing AI apps.',
  what: 'Front Door is a global, Microsoft-network-backed entry point for web traffic. Users connect to a nearby edge location, and Front Door routes the request to the healthiest origin (an app in [[container-apps]], [[aks]] or [[apim]]). It adds **TLS termination**, **web application firewall (WAF)** rules, rate limiting, caching for static content and health-probe-based failover.\n\nFor AI apps it provides two things: protection from abusive traffic before it costs tokens, and a stable global address with multi-Region failover for the chat front end.',
  flow: ['User', 'Edge location', 'WAF + rate limit', 'Routing + health probes', 'Origin (app / gateway)', 'Streamed response'],
  steps: [
    [0, 'A user\'s request resolves to the nearest Front Door edge location.'],
    [1, 'The **WAF** evaluates managed and custom rules, including rate limits per client IP.'],
    [2, 'Front Door matches a route and chooses an origin by priority, weight and **health probes**.'],
    [3, 'The request is forwarded over the Microsoft backbone, optionally to a private origin through Private Link.'],
    [4, 'The origin (a web app or [[apim|AI gateway]]) handles it and starts streaming the answer.'],
    [5, 'Front Door relays the stream to the user; failed origins are removed from rotation automatically.']
  ],
  gotchas: [
    '**Origin response timeout is limited.** The default is around a minute and is configurable up to a few minutes; long non-streaming responses will be cut off.',
    '**Caching and AI responses do not mix by default.** Keep dynamic and personalised responses out of the cache.',
    '**Private origins need the Premium tier** and an approval step on the Private Link connection.',
    '**WAF rate limits are per IP**, which does not stop a distributed abuser or a shared corporate NAT. Pair with per-user limits at the gateway.',
    '**Compression and buffering settings** can interfere with token streaming; test the whole path.'
  ],
  edges: [
    'Custom domains and managed certificates simplify branded endpoints.',
    'Rules engine can rewrite headers and route by path, useful for versioned APIs.',
    'Combining Front Door in front and [[apim]] behind gives edge protection plus API-level governance.'
  ],
  ml: [
    'Global, protected entry for chat and agent front ends with failover between Regions.',
    'Edge rate limiting and bot rules that protect against denial-of-wallet traffic.',
    'Private connectivity to origins that must not be public.',
    'Serving static assets and the web UI close to users while model calls run elsewhere.'
  ],
  pairs: ['apim', 'container-apps', 'aks', 'private-link', 'entra-id'],
  cost: 'Billed with a base fee per profile (Standard or Premium) plus per-request and outbound data charges, and WAF rules. Edge traffic charges are modest compared with model costs.'
});

S({
  id: 'private-link', cat: 'networking', name: 'Virtual Network & Private Link', doc: 'azure/private-link/',
  tag: 'Keep prompts and data off the public internet with private endpoints and controlled egress.',
  what: 'A **virtual network (VNet)** is your private address space in Azure. **Private Link** projects a PaaS service (a Foundry resource, [[ai-search]], [[blob]], [[cosmos]], [[key-vault]]) into your VNet as a **private endpoint**: a private IP address that reaches that service over Microsoft\'s backbone. With public network access disabled on the service, traffic can only arrive through your network.\n\nFor regulated workloads this is usually a requirement, not an option. It also forces you to think about DNS, egress and how developers reach resources, which is where most of the real work lies.',
  flow: ['App in VNet', 'Private DNS lookup', 'Private endpoint (private IP)', 'Service (public access off)', 'Egress control', 'Logs'],
  steps: [
    [0, 'An app or agent running in your VNet calls a service by its normal hostname.'],
    [1, 'A **private DNS zone** (for example `privatelink.search.windows.net`) resolves that name to the private endpoint\'s IP.'],
    [2, 'Traffic goes to the private endpoint inside your VNet and across the Microsoft backbone to the service.'],
    [3, 'The service has **public network access disabled**, so requests from the internet are refused.'],
    [4, 'Outbound traffic to other destinations is controlled by firewall rules, NSGs and, where used, a managed network for the service.'],
    [5, 'Flow logs and diagnostic settings record who connected, feeding [[azure-monitor]].']
  ],
  gotchas: [
    '**DNS is the number one problem.** If the private zone is not linked to every VNet (and to on-premises resolvers), the name resolves to a public IP and calls fail or take the wrong path.',
    '**Everything that needs the service must be inside the network.** CI runners, developers and managed services (indexers, agent runtimes) each need a route or a supported private option.',
    '**Each endpoint costs money** and an IP. Dozens of services times several environments adds up.',
    '**Some managed features need extra setup** for private networking, such as dedicated delegated subnets for agent runtimes, or approved outbound rules for managed network isolation.',
    '**Egress matters too.** A private inbound path does not stop data leaving through open outbound.'
  ],
  edges: [
    '**Network security perimeters** group PaaS resources under one boundary with shared access rules, an alternative to many endpoints for some services.',
    'Service endpoints are an older, simpler option that does not give a private IP.',
    'Hub-and-spoke designs centralise firewalls and DNS for many workloads.'
  ],
  ml: [
    'Private access from apps to [[foundry-models]], [[ai-search]] and storage for regulated data.',
    'Isolated training: [[aml-workspace|Azure ML managed network]] with approved outbound destinations only.',
    'Preventing data exfiltration by controlling egress from agent runtimes.',
    'Keeping developer access to production data on a controlled path.'
  ],
  pairs: ['foundry', 'ai-search', 'blob', 'key-vault', 'aml-workspace', 'azure-policy'],
  cost: 'Private endpoints bill per hour plus per GB processed; VNets are free but firewalls, gateways and peering carry costs. DNS and network design time is the larger hidden cost.'
});
