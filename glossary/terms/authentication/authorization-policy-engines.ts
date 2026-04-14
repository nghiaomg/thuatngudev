import type { GlossaryTerm } from '../../types'

export const authorizationPolicyEnginesTerms: GlossaryTerm[] = [
  {
    id: 'authz-policy-1',
    term: 'OPA (Open Policy Agent)',
    slug: 'opa-open-policy-agent',
    category: 'Authentication',
    definition:
      'OPA là policy engine open-source cho phép định nghĩa và thực thi authorization policies dưới dạng code (Rego language). Decouples policy từ application code, cho phép centralized policy management.',
    details:
      '**OPA Architecture:**\n```\nApplication → OPA Sidecar → Policy Decision (Allow/Deny)\n                ↓\n          Policies (Rego)\n                ↓\n          Input + Data\n```\n\n**Key Concepts:**\n- **Policy**: Rules định nghĩa access control\n- **Rego**: Declarative policy language\n- **Decision**: Allow/Deny result từ policy evaluation\n- **Input**: Request context (user, action, resource)\n- **Data**: External data (user roles, permissions)\n\n**Deployment Options:**\n- **Sidecar**: Deploy cùng application\n- **Daemon**: Centralized policy service\n- **Library**: Embedded trong application (WASM)\n\n**Use Cases:**\n- Microservices authorization\n- Kubernetes admission control\n- API gateway policies\n- CI/CD policy enforcement\n- Terraform plan validation\n\n**Advantages:**\n- Policy as code (version control, testing)\n- Decoupled từ application code\n- Standardized across services\n- Audit và compliance friendly\n- CNCF graduated project\n\n**Integration:**\n- REST API (HTTP POST /v1/data/policy)\n- gRPC\n- OPA-Envoy (service mesh)\n- Kubernetes admission webhooks',
    examples: [
      {
        title: 'OPA Policy với Rego',
        code: `# OPA Policy (Rego language)
package authz

import rego.v1

# Default deny
default allow = false

# Rule 1: Admin có thể làm mọi thứ
allow if {
  input.user.roles[_] == "admin"
  input.action == "delete"
  input.resource == "users"
}

# Rule 2: Manager có thể view reports trong business hours
allow if {
  input.user.roles[_] == "manager"
  input.resource == "reports"
  input.action == "read"
  hour := time.clock([0, 0, 0, input.user.current_time, ""])[0]
  hour >= 8
  hour <= 18
}

# Rule 3: User có thể edit profile của chính mình
allow if {
  input.user.id == input.resource.owner_id
  input.action == "update"
  input.resource == "profile"
}

# Rule 4: Same department có thể access internal documents
allow if {
  input.resource.classification == "internal"
  input.user.department == input.resource.department
  input.user.roles[_] == "employee"
}

# Rule 5: Restricted documents yêu cầu clearance level >= 5
deny if {
  input.resource.classification == "restricted"
  input.user.clearance_level < 5
}

# Query OPA
# POST /v1/data/authz/allow
# Body: {
#   "input": {
#     "user": {"id": "123", "roles": ["manager"], ...},
#     "action": "read",
#     "resource": "reports"
#   }
# }`,
        explanation:
          'Rego là declarative policy language. Rules được evaluate tự động, default deny. Multiple rules với OR logic. OPA returns allow/deny decision.',
      },
      {
        title: 'Ứng dụng OPA trong Node.js',
        code: `const express = require('express');
const app = express();

// OPA client
class OPAClient {
  constructor(opaUrl = 'http://localhost:8181') {
    this.opaUrl = opaUrl;
  }

  async check(request) {
    const response = await fetch(\`\${this.opaUrl}/v1/data/authz/allow\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: request })
    });

    const result = await response.json();
    return result.result === true;
  }
}

const opa = new OPAClient();

// Authorization middleware
async function authorize(req, res, next) {
  const policyInput = {
    user: req.user,
    action: req.method.toLowerCase(),
    resource: req.params[0] || 'default',
    current_time: Date.now()
  };

  const allowed = await opa.check(policyInput);

  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}

// Usage
app.delete('/users/:id',
  authenticateToken,
  authorize,
  async (req, res) => {
    // Only reaches here if OPA allows
    await deleteUser(req.params.id);
    res.status(204).send();
  }
);

// OPA với caching (giảm latency)
class OPAClientWithCache {
  constructor(ttlMs = 60000) {
    this.cache = new Map();
    this.ttl = ttlMs;
  }

  async check(request) {
    const cacheKey = JSON.stringify(request);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.ttl) {
      return cached.result;
    }

    const result = await this.evaluatePolicy(request);
    this.cache.set(cacheKey, {
      result,
      timestamp: Date.now()
    });

    return result;
  }

  async evaluatePolicy(request) {
    // Call OPA API
    // ...
  }
}`,
        explanation:
          'OPA deploy như sidecar hoặc centralized service. Application gửi request context, OPA trả về allow/deny. Caching giảm policy evaluation latency.',
      },
      {
        title: 'OPA Testing và CI/CD',
        code: `# OPA policies có thể test được
# authz_test.rego
package authz

test_admin_can_delete_users {
  input := {
    "user": {"id": "1", "roles": ["admin"]},
    "action": "delete",
    "resource": "users"
  }
  allow with input as input
}

test_manager_can_view_reports {
  input := {
    "user": {"id": "2", "roles": ["manager"], "current_time": 1704067200000},
    "action": "read",
    "resource": "reports"
  }
  allow with input as input
}

test_user_cannot_delete_others_profile {
  input := {
    "user": {"id": "123", "roles": ["employee"]},
    "action": "update",
    "resource": {"owner_id": "456", "type": "profile"}
  }
  not allow with input as input
}

# Chạy tests
# opa test .
# opa test -v .  # verbose output

# CI/CD pipeline
# .github/workflows/policies.yml
# - name: Test OPA policies
#   run: opa test policies/ -v

# Deploy policies
# opa publish policies.tar.gz

# OPA với Kubernetes admission control
# admission.yaml
apiVersion: admissionregistration.k8s.io/v1
kind: ValidatingWebhookConfiguration
metadata:
  name: opa-validating-webhook
webhooks:
  - name: validating-webhook.openpolicyagent.org
    clientConfig:
      service:
        namespace: opa
        name: opa
        path: /v1/data/kubernetes/admission/deny`,
        explanation:
          'OPA policies có thể test unit tests. CI/CD validate policies trước khi deploy. Kubernetes admission control dùng OPA để enforce cluster policies.',
      },
    ],
    relatedTerms: ['ABAC', 'Policy Engine', 'Casbin', 'Authorization', 'Rego'],
    tags: ['opa', 'open-policy-agent', 'policy-engine', 'authorization', 'rego'],
  },
  {
    id: 'authz-policy-2',
    term: 'Casbin',
    slug: 'casbin',
    category: 'Authentication',
    definition:
      'Casbin là authorization library open-source hỗ trợ nhiều authorization models (ACL, RBAC, ABAC, RESTful) qua nhiều ngôn ngữ (Go, Java, Node.js, Python, PHP). Lightweight và embeddable trong applications.',
    details:
      '**Casbin Core Concepts:**\n- **Model**: Definition của authorization logic (PERM metamodel)\n- **Policy**: Rules cụ thể (who, what, how)\n- **Adapter**: Storage backend (file, database, Redis)\n- **Enforcer**: Runtime policy evaluation engine\n\n**PERM Metamodel (Policy, Effect, Request, Matcher):**\n- **Request**: Định nghĩa request format (subject, object, action)\n- **Policy**: Rules cho phép access\n- **Matcher**: Logic matching request với policy\n- **Effect**: Kết quả cuối cùng (allow/deny)\n\n**Supported Models:**\n1. **ACL** (Access Control Lists)\n2. **RBAC** (Role-Based Access Control)\n3. **ABAC** (Attribute-Based Access Control)\n4. **RESTful** (Resource-based)\n5. **Deny-Override**\n6. **Priority** (Priority-based policies)\n\n**Advantages:**\n- Multi-language support\n- Embeddable (no separate service)\n- Hot-reload policies\n- Multiple storage backends\n- High performance\n- No vendor lock-in\n\n**Vs OPA:**\n- Casbin: Library embedded trong app\n- OPA: Separate service/sidecar\n- Casbin: Multiple languages\n- OPA: Rego language only\n- Casbin: Simpler deployment\n- OPA: More features (testing, WASM)',
    examples: [
      {
        title: 'Casbin RBAC Implementation',
        code: `// Node.js Casbin
const { newEnforcer } = require('casbin');

// 1. Create enforcer với model và policy
const enforcer = await newEnforcer('rbac_model.conf', 'rbac_policy.csv');

// rbac_model.conf
/*
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act
*/

// rbac_policy.csv
/*
p, admin, users, create
p, admin, users, delete
p, admin, users, read
p, admin, users, update
p, editor, posts, create
p, editor, posts, delete
p, user, posts, read
g, alice, admin
g, bob, editor
g, charlie, user
*/

// 2. Check permissions
async function checkPermission(userId, resource, action) {
  const allowed = await enforcer.enforce(userId, resource, action);
  return allowed;
}

// Usage
const canDelete = await checkPermission('alice', 'users', 'delete');
console.log(canDelete); // true (alice is admin)

const canDeletePosts = await checkPermission('bob', 'posts', 'delete');
console.log(canDeletePosts); // true (bob is editor)

const canDeleteUsers = await checkPermission('charlie', 'users', 'delete');
console.log(canDeleteUsers); // false (charlie chỉ là user)

// 3. Middleware
async function authorize(resource, action) {
  return async (req, res, next) => {
    const allowed = await enforcer.enforce(req.user.id, resource, action);
    if (!allowed) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

app.delete('/users/:id',
  authenticateToken,
  authorize('users', 'delete'),
  deleteUserHandler
);`,
        explanation:
          'Casbin dùng PERM metamodel: Request, Policy, Effect, Matcher. Policies lưu trong CSV hoặc database. Enforcer evaluates requests against policies.',
      },
      {
        title: 'Casbin ABAC và Dynamic Policies',
        code: `// ABAC model với Casbin
const enforcer = await newEnforcer('abac_model.conf');

// abac_model.conf
/*
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = r.sub.Age > 18 && r.sub.Department == r.obj.Department && r.act == "read"
*/

// ABAC evaluation
const request = {
  sub: { Name: 'alice', Age: 25, Department: 'engineering' },
  obj: { Name: 'eng-docs', Department: 'engineering' },
  act: 'read'
};

const allowed = await enforcer.enforce(request);
console.log(allowed); // true (cùng department, age > 18)

// Dynamic policy updates (hot-reload)
// Thêm policy mới
await enforcer.addPolicy('manager', 'reports', 'delete');

// Xóa policy
await enforcer.removePolicy('user', 'users', 'delete');

// Reload policies từ storage
await enforcer.loadPolicy();

// Adapter pattern - lưu policies trong database
const { SequelizeAdapter } = require('casbin-sequelize-adapter');

const adapter = await SequelizeAdapter.newAdapter({
  dialect: 'postgres',
  host: 'localhost',
  database: 'casbin',
  username: 'postgres',
  password: 'password'
});

const enforcer = await newEnforcer('rbac_model.conf', adapter);

// Policies được lưu trong DB, có thể update runtime
await enforcer.addPolicy('admin', 'users', 'delete');
await enforcer.savePolicy();`,
        explanation:
          'ABAC model cho phép attribute-based matching. Policies có thể add/remove dynamically. Adapter lưu policies trong database thay vì file.',
      },
      {
        title: 'Casbin RESTful API Authorization',
        code: `// RESTful model cho API
const enforcer = await newEnforcer('restful_model.conf', 'restful_policy.csv');

// restful_model.conf
/*
[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && keyMatch(r.obj, p.obj) && regexMatch(r.act, p.act)
*/

// restful_policy.csv
/*
p, admin, /users/*, (GET|POST|PUT|DELETE)
p, editor, /posts/*, (GET|POST|PUT|DELETE)
p, editor, /comments/*, (GET|POST|PUT|DELETE)
p, user, /posts/*, GET
p, user, /profile, (GET|PUT)
g, alice, admin
g, bob, editor
g, charlie, user
*/

// RESTful middleware
async function restfulAuthorize(req, res, next) {
  const request = {
    sub: req.user.id,
    obj: req.path,
    act: req.method.toLowerCase()
  };

  const allowed = await enforcer.enforce(request);
  if (!allowed) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// Usage
app.use('/api', authenticateToken, restfulAuthorize);

app.get('/api/posts', (req, res) => {
  // Tất cả users có thể access
});

app.delete('/api/users/:id', (req, res) => {
  // Chỉ admin có thể access
});

app.put('/api/profile', (req, res) => {
  // Users có thể update profile của mình
});

// KeyMatch functions
// keyMatch: /alice/resource == /alice/*
// keyMatch2: /alice/resource/:id == /alice/:param
// keyMatch3: /alice/resource/123 == /alice/:id
// keyMatch4: /alice/resource/123 == /{owner}/resource/{id}`,
        explanation:
          'RESTful model dùng keyMatch cho path patterns. regexMatch cho HTTP methods. KeyMatch2/3/4 cho URL parameters (/:id, /{id}).',
      },
    ],
    relatedTerms: ['RBAC', 'ABAC', 'ACL', 'Policy Engine', 'OPA', 'Authorization'],
    tags: ['casbin', 'authorization', 'rbac', 'abac', 'acl', 'policy-engine'],
  },
  {
    id: 'authz-policy-3',
    term: 'Permission-based Authorization',
    slug: 'permission-based-authz',
    category: 'Authentication',
    definition:
      'Permission-based Authorization gán permissions trực tiếp cho users thay vì qua roles. Mỗi permission định nghĩa right để thực hiện specific action trên specific resource.',
    details:
      '**Permission Model:**\n- **Permission**: {resource, action, conditions}\n- **User-Permission Mapping**: User có list of permissions\n- **Direct Assignment**: Không cần roles\n\n**Permission Structure:**\n```\nuser:permissions = [\n  "users:create",\n  "users:read",\n  "users:update:own",\n  "posts:delete"\n]\n```\n\n**Advantages:**\n- Fine-grained control\n- Flexible cho edge cases\n- Không cần role hierarchy\n- Simple cho small systems\n\n**Disadvantages:**\n- Permission explosion (quản lý khó)\n- Không scale tốt cho large organizations\n- Khó audit (ai có permission gì?)\n- Manual management overhead\n\n**When to Use:**\n- Small teams (< 50 users)\n- Custom per-user permissions\n- Temporary access grants\n- Supplement to RBAC (override roles)\n\n**Hybrid Approach:**\n- RBAC cho bulk permissions\n- Permission-based cho exceptions\n- Users inherit từ role + có custom permissions',
    examples: [
      {
        title: 'Permission-based Authorization System',
        code: `// Permission model
class PermissionManager {
  constructor() {
    this.userPermissions = new Map();
    this.rolePermissions = new Map();
  }

  // Grant permission trực tiếp cho user
  grantPermission(userId, resource, action, conditions = {}) {
    const key = \`\${userId}:\${resource}:\${action}\`;
    this.userPermissions.set(key, {
      userId,
      resource,
      action,
      conditions,
      grantedAt: Date.now()
    });
  }

  // Revoke permission
  revokePermission(userId, resource, action) {
    const key = \`\${userId}:\${resource}:\${action}\`;
    this.userPermissions.delete(key);
  }

  // Check permission
  async hasPermission(userId, resource, action, context = {}) {
    const key = \`\${userId}:\${resource}:\${action}\`;
    const permission = this.userPermissions.get(key);

    if (!permission) {
      return false;
    }

    // Evaluate conditions
    if (permission.conditions) {
      for (const [field, expectedValue] of Object.entries(permission.conditions)) {
        if (context[field] !== expectedValue) {
          return false;
        }
      }
    }

    return true;
  }

  // Hybrid: RBAC + permission-based
  async checkAccess(userId, resource, action, context = {}) {
    // Check role-based permissions first
    const user = await getUser(userId);
    const hasRolePermission = this.roleHasPermission(user.role, resource, action);
    if (hasRolePermission) return true;

    // Check direct permissions
    return this.hasPermission(userId, resource, action, context);
  }
}

// Usage
const pm = new PermissionManager();

// Grant custom permission cho user (override role)
pm.grantPermission('user-123', 'users', 'delete', {
  department: 'hr'  // Chỉ có thể delete users trong HR
});

pm.grantPermission('user-456', 'posts', 'publish', {
  maxPostsPerDay: 5
});

// Check với conditions
const canDelete = await pm.checkAccess('user-123', 'users', 'delete', {
  department: 'hr'
});
console.log(canDelete); // true

const canDeleteWrongDept = await pm.checkAccess('user-123', 'users', 'delete', {
  department: 'engineering'
});
console.log(canDeleteWrongDept); // false

// Database-backed permissions
async function getUserPermissions(userId) {
  return db.permissions.findMany({
    where: { userId },
    include: { resource: true }
  });
}`,
        explanation:
          'Permission-based gán permissions trực tiếp cho users. Conditions cho phép fine-grained control. Hybrid approach kết hợp RBAC + permissions cho flexibility.',
      },
    ],
    relatedTerms: ['RBAC', 'ABAC', 'ACL', 'Authorization', 'Fine-grained Access'],
    tags: ['permissions', 'authorization', 'fine-grained', 'access-control'],
  },
  {
    id: 'authz-policy-4',
    term: 'Hierarchical RBAC',
    slug: 'hierarchical-rbac',
    category: 'Authentication',
    definition:
      'Hierarchical RBAC extends RBAC bằng cách thêm role inheritance — roles có thể inherit permissions từ roles khác, tạo role hierarchy tree. Giảm permission duplication và simplify role management.',
    details:
      '**Role Inheritance:**\n```\nSuper Admin\n  ↓\nAdmin\n  ↓\nManager\n  ↓\nEmployee\n  ↓\nIntern\n```\n\n**Inheritance Rules:**\n- Child role inherits all parent permissions\n- Child có thể có additional permissions\n- Multiple inheritance possible (DAG)\n- No circular inheritance\n\n**RBAC Levels:**\n1. **Flat RBAC**: No inheritance\n2. **Hierarchical RBAC**: Role inheritance\n3. **Constrained RBAC**: Separation of duties\n4. **Symmetric RBAC**: Permission-role review\n\n**Advantages:**\n- DRY (Don\'t Repeat Yourself) cho permissions\n- Easier role management\n- Clear organizational structure\n- Reduced permission conflicts\n\n**Use Cases:**\n- Corporate hierarchies\n- Government/military ranks\n- Educational institutions\n- Multi-tenant SaaS (org-specific hierarchies)',
    examples: [
      {
        title: 'Hierarchical RBAC Implementation',
        code: `// Role hierarchy
const roleHierarchy = {
  'super-admin': {
    inherits: [],
    permissions: ['*']  // All permissions
  },
  'admin': {
    inherits: ['manager'],
    permissions: [
      'users:create',
      'users:delete',
      'system:configure'
    ]
  },
  'manager': {
    inherits: ['employee'],
    permissions: [
      'team:manage',
      'reports:create',
      'reports:approve'
    ]
  },
  'employee': {
    inherits: ['intern'],
    permissions: [
      'posts:create',
      'posts:edit:own',
      'comments:create'
    ]
  },
  'intern': {
    inherits: [],
    permissions: [
      'posts:read',
      'comments:read'
    ]
  }
};

// Get all permissions cho role (bao gồm inherited)
function getRolePermissions(roleName) {
  const role = roleHierarchy[roleName];
  if (!role) return [];

  let permissions = [...role.permissions];

  // Recursively get inherited permissions
  for (const parentRole of role.inherits) {
    const parentPermissions = getRolePermissions(parentRole);
    permissions = [...new Set([...permissions, ...parentPermissions])];
  }

  return permissions;
}

// Check permission
function hasPermission(roleName, resource, action) {
  const permissions = getRolePermissions(roleName);
  const permission = \`\${resource}:\${action}\`;

  // Check wildcard
  if (permissions.includes('*')) return true;

  return permissions.includes(permission);
}

// Usage
console.log(hasPermission('manager', 'posts', 'read'));  // true (inherited)
console.log(hasPermission('manager', 'team', 'manage')); // true (own)
console.log(hasPermission('manager', 'users', 'delete')); // false (admin only)

// Database-backed hierarchy
async function getRoleHierarchyFromDB() {
  const roles = await db.roles.findMany({
    include: {
      permissions: true,
      parentRoles: true
    }
  });

  const hierarchy = {};
  roles.forEach(role => {
    hierarchy[role.name] = {
      inherits: role.parentRoles.map(r => r.name),
      permissions: role.permissions.map(p => \`\${p.resource}:\${p.action}\`)
    };
  });

  return hierarchy;
}

// Constrained RBAC - Separation of Duties
const mutuallyExclusiveRoles = {
  'approver': 'requester',
  'auditor': 'operator',
  'reviewer': 'author'
};

function canAssignRole(userId, newRole) {
  const userRoles = getUserRoles(userId);

  for (const [role1, role2] of Object.entries(mutuallyExclusiveRoles)) {
    if (userRoles.includes(role1) && newRole === role2) {
      return false; // Violation of separation of duties
    }
  }

  return true;
}`,
        explanation:
          'Hierarchical RBAC dùng inheritance để reduce duplication. Manager inherits Employee permissions. Constrained RBAC enforce separation of duties.',
      },
    ],
    relatedTerms: ['RBAC', 'Role Inheritance', 'Separation of Duties', 'Authorization'],
    tags: ['hierarchical-rbac', 'role-inheritance', 'rbac', 'authorization', 'permissions'],
  },
]
