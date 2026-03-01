---
title: CAF Allowlist specification
description: Single source for CAF-allowed terms and abbreviation mappings. Input for WP1–WP3.
---

# CAF allowlist specification

This document is the **single reference** for all CAF (Cloud Adoption Framework) terminology and abbreviations used in this project. WP1, WP2, and WP3 use this spec as input. No other CAF word lists or abbreviation tables should be used.

**Principle**: CAF document standard only; non-major resource types are **spelled out** (no ad-hoc abbreviations).

**Source**: [Microsoft CAF – Resource naming](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-naming), [Resource abbreviations](https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/resource-abbreviations).

---

## Component 1 — Allowed words (CAF naming components)

Allowed terms for workload, application, or project names and general naming components. Use **only** these when generating or validating CAF-style names.

| Term | Use |
|------|-----|
| shared | Shared / common workload |
| client | Client application or component |
| application | Application scope |
| navigator | Example workload (CAF doc) |
| emissions | Example workload (CAF doc) |
| sharepoint | Example workload (CAF doc) |
| hadoop | Example workload (CAF doc) |

**Rule**: To add terms, update this table and get team agreement; then treat as final.

---

## Component 2 — Resource type abbreviations

### Major (keep as-is)

These abbreviations are **retained** in resource names. Short, well-known, and within CAF length limits.

| Abbreviation | Meaning |
|--------------|---------|
| app | Web app |
| redis | Azure Cache for Redis |
| sql | Azure SQL Database server |
| test | Environment / test |
| prod | Production |
| dev | Development |
| qa | Quality assurance |
| stage | Staging |
| config | Configuration |
| log | Log Analytics workspace |

### Non-major (spell out)

Use the **full form** in generated names or in tooling that normalizes names. Mapping: abbreviation → full form.

| Abbreviation | Full form |
|--------------|-----------|
| rg | resourcegroup |
| st | storage |
| vm | virtualmachine |
| vnet | virtualnetwork |
| func | function |
| sqldb | sqldatabase |
| kv | keyvault |
| nic | networkinterface |
| nsg | networksecuritygroup |
| pip | publicip |
| vgw | virtualnetworkgateway |
| snet | subnet |
| cosmos | cosmosdb |
| adf | datafactory |
| evh | eventhub |
| sbns | servicebusnamespace |
| sbq | servicebusqueue |
| sbt | servicebustopic |
| apim | apimanagement |
| cr | containerregistry |
| aks | kubernetesservice |
| mysql | mysqldatabase |
| psql | postgresql |
| sqlmi | sqlmanagedinstance |
| dls | datalakestore |
| synw | synapseworkspace |
| mlw | machinelearningworkspace |
| oai | openai |
| appi | applicationinsights |
| ase | appserviceenvironment |
| asp | appserviceplan |
| vmss | virtualmachinescaleset |
| pl | privatelink |
| pep | privateendpoint |
| afw | azurefirewall |
| agw | applicationgateway |
| rsv | recoveryservicesvault |
| mg | managementgroup |
| ts | templatespec |
| aa | automationaccount |
| logic | logicapp |
| ia | integrationaccount |
| bot | botservice |
| srch | search |
| map | maps |
| sigr | signalr |
| wps | webpubsub |

**Rule**: Any CAF abbreviation not listed in **Major (keep as-is)** is treated as non-major and must be spelled out using this table (or added here after review).

---

## Component 3 — Environment values

Allowed environment segment values. Use **only** these for the environment component.

| Value | Meaning |
|-------|---------|
| prod | Production |
| dev | Development |
| test | Test |
| qa | Quality assurance |
| stage | Staging |

---

## Component 4 — Region (CAF example list)

Allowed region segment values for CAF-style names. This list is the **CAF example set**; the full Azure region list is in [Azure regions](https://learn.microsoft.com/en-us/azure/reliability/regions-list).

| Code | Description |
|------|-------------|
| eastus | East US |
| eastus2 | East US 2 |
| westus | West US |
| westus2 | West US 2 |
| westus3 | West US 3 |
| centralus | Central US |
| southcentralus | South Central US |
| northcentralus | North Central US |
| westeurope | West Europe |
| northeurope | North Europe |
| uksouth | UK South |
| francecentral | France Central |
| germanywestcentral | Germany West Central |
| canadacentral | Canada Central |
| brazilsouth | Brazil South |
| australiaeast | Australia East |
| southeastasia | Southeast Asia |
| eastasia | East Asia |
| japaneast | Japan East |
| koreacentral | Korea Central |

**Note**: CAF docs also mention short forms such as `usva`, `ustx` for some scenarios; if used, add them to this table after team agreement.

---

## Component 5 — Numeric pattern

Instance or identifier suffix in resource names.

| Pattern | Description | Example |
|---------|-------------|---------|
| 4 digits | Instance number | `0001`, `0002` |

**Rule**: Only numeric digits; exactly 4 characters. Use leading zeros for consistency (e.g. `0001`, `0002`).

---

## Document status

- **Version**: 1.0 (initial)
- **Status**: Draft — to be fixed as final after team agreement.
- **When final**: Commit this document; WP1, WP2, WP3 will reference it as the single input for CAF allowlist and abbreviation mapping.
