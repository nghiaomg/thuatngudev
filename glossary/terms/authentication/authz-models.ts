import type { GlossaryTerm } from '../../types'

export const authzModelsTerms: GlossaryTerm[] = [
  {
    id: 'authz-1',
    term: 'RBAC (Role-Based Access Control)',
    slug: 'rbac',
    category: 'Authentication',
    definition:
      'RBAC là mô hình authorization gán permissions dựa trên roles của user. Thay vì gán permissions trực tiếp cho từng user, permissions được gán cho roles, và users được gán vào roles.',
    details:
      '**RBAC Components:**\n- **Users**: People hoặc systems cần access\n- **Roles**: Named collections of permissions\n- **Permissions**: Rights to perform specific actions\n- **Sessions**: Context trong đó user activates subset of roles\n\n**RBAC Levels:**\n1. **Flat RBAC**: Users -> Roles -> Permissions\n2. **Hierarchical RBAC**: Roles inherit from other roles (Senior > Junior)\n3. **Constrained RBAC**: Separation of duties (mutually exclusive roles)\n4. **Symmetric RBAC**: Role-permission review capabilities\n\n**Best Practices:**\n- Follow principle of least privilege\n- Regular role audits\n- Avoid role explosion\n- Separate admin roles from user roles\n\n**Limitations:**\n- Không handle context-aware decisions (time, location)\n- Role explosion trong organizations phức tạp\n- Không support per-resource permissions tốt',
    examples: [
      {
        title: 'RBAC Implementation',
        code: `// Role-Based Access Control
const roles = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    posts: ['create', 'read', 'update', 'delete'],
    settings: ['read', 'update']
  },
  editor: {
    posts: ['create', 'read', 'update', 'delete'],
    users: ['read'],
    comments: ['create', 'read', 'update', 'delete']
  },
  user: {
    posts: ['read'],
    comments: ['create', 'read', 'update', 'delete'],
    profile: ['read', 'update']
  }
};

// Check permission
function hasPermission(role, resource, action) {
  const permissions = roles[role];
  if (!permissions || !permissions[resource]) {
    return false;
  }
  return permissions[resource].includes(action);
}

// Middleware
function authorize(resource, action) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!hasPermission(req.user.role, resource, action)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    next();
  };
}

// Resource-level authorization
app.delete('/posts/:id',
  authorize('posts', 'delete'),
  async (req, res) => {
    const post = await db.posts.findById(req.params.id);
    if (post.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Cannot delete others posts' });
    }
    await db.posts.delete(req.params.id);
    res.status(204).send();
  }
);`,
        explanation:
          'RBAC định nghĩa permissions theo role. Admin có full permissions, user có limited. Resource-level check thêm layer protection.',
      },
      {
        title: 'Database-backed RBAC',
        code: `// Database schema cho RBAC
// Users table
// - id, email, name

// Roles table
// - id, name, description

// Permissions table
// - id, resource, action

// Role_Permissions table (many-to-many)
// - role_id, permission_id

// User_Roles table (many-to-many)
// - user_id, role_id

// Query permissions
async function getUserPermissions(userId: number) {
  const permissions = await db.query(\`
    SELECT DISTINCT p.resource, p.action
    FROM users u
    JOIN user_roles ur ON u.id = ur.user_id
    JOIN role_permissions rp ON ur.role_id = rp.role_id
    JOIN permissions p ON rp.permission_id = p.id
    WHERE u.id = \$1
  \`, [userId]);

  // Group by resource
  const grouped = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm.action);
    return acc;
  }, {});

  return grouped;
}

// Check permission
async function can(userId: number, action: string, resource: string) {
  const perms = await getUserPermissions(userId);
  return perms[resource]?.includes(action) ?? false;
}

// Usage
app.delete('/posts/:id', async (req, res) => {
  const canDelete = await can(req.user.id, 'delete', 'posts');
  if (!canDelete) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  // Proceed with deletion
});`,
        explanation:
          'Database-backed RBAC cho phép dynamic role management. Query permissions tại runtime. Cache results để improve performance.',
      },
    ],
    relatedTerms: ['Authorization', 'ABAC', 'ACL', 'RBAC', 'Permissions'],
    tags: ['rbac', 'authorization', 'access-control', 'roles', 'permissions'],
  },
  {
    id: 'authz-2',
    term: 'ABAC (Attribute-Based Access Control)',
    slug: 'abac',
    category: 'Authentication',
    definition:
      'ABAC là mô hình authorization đánh giá permissions dựa trên attributes của subject, resource, action, và environment. Flexible hơn RBAC, cho phép fine-grained access control.',
    details:
      '**ABAC Components:**\n- **Subject Attributes**: User properties (role, department, clearance level)\n- **Resource Attributes**: Object properties (owner, classification, type)\n- **Action Attributes**: Operation type (read, write, delete)\n- **Environment Attributes**: Context (time, location, device, IP)\n\n**ABAC Policies:**\n- Policies được định nghĩa bằng logical rules\n- Example: "Managers có thể view reports trong business hours từ office network"\n\n**Advantages over RBAC:**\n- Context-aware decisions\n- Fine-grained control\n- Dynamic evaluation\n- Không bị role explosion\n\n**Disadvantages:**\n- Phức tạp hơn RBAC\n- Khó audit và debug\n- Performance overhead\n- Policy management complexity\n\n**Use Cases:**\n- Government/military (classification levels)\n- Healthcare (HIPAA compliance)\n- Financial services (regulatory requirements)\n- Multi-tenant SaaS applications',
    examples: [
      {
        title: 'ABAC Policy Engine',
        code: `// ABAC Policy Evaluation
interface PolicyContext {
  subject: {
    id: string;
    role: string;
    department: string;
    clearanceLevel: number;
  };
  resource: {
    type: string;
    ownerId: string;
    classification: 'public' | 'internal' | 'confidential' | 'restricted';
    department: string;
  };
  action: 'read' | 'write' | 'delete' | 'share';
  environment: {
    time: Date;
    location: string;
    ip: string;
    device: string;
  };
}

// Policy rules
function evaluatePolicy(context: PolicyContext): boolean {
  const { subject, resource, action, environment } = context;

  // Rule 1: Owner luôn có quyền read/write resource của mình
  if (subject.id === resource.ownerId && ['read', 'write'].includes(action)) {
    return true;
  }

  // Rule 2: Manager có thể view reports trong business hours
  if (
    subject.role === 'manager' &&
    resource.type === 'report' &&
    action === 'read' &&
    environment.time.getHours() >= 8 &&
    environment.time.getHours() <= 18
  ) {
    return true;
  }

  // Rule 3: Confidential documents chỉ accessible từ office network
  if (
    resource.classification === 'confidential' &&
    !environment.location.includes('office')
  ) {
    return false;
  }

  // Rule 4: Restricted documents yêu cầu high clearance level
  if (
    resource.classification === 'restricted' &&
    subject.clearanceLevel < 5
  ) {
    return false;
  }

  // Rule 5: Same department có thể access internal documents
  if (
    resource.classification === 'internal' &&
    subject.department === resource.department
  ) {
    return true;
  }

  // Default deny
  return false;
}

// Usage
app.get('/documents/:id', async (req, res) => {
  const document = await db.documents.findById(req.params.id);
  const user = req.user;

  const context: PolicyContext = {
    subject: {
      id: user.id,
      role: user.role,
      department: user.department,
      clearanceLevel: user.clearanceLevel
    },
    resource: {
      type: document.type,
      ownerId: document.ownerId,
      classification: document.classification,
      department: document.department
    },
    action: 'read',
    environment: {
      time: new Date(),
      location: req.headers['x-location'],
      ip: req.ip,
      device: req.headers['x-device-type']
    }
  };

  const allowed = evaluatePolicy(context);
  if (!allowed) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(document);
});`,
        explanation:
          'ABAC evaluates policies dựa trên multiple attributes. Context-aware decisions (time, location, classification). Default deny nếu không match rules.',
      },
    ],
    relatedTerms: ['Authorization', 'RBAC', 'Policy Engine', 'OPA', 'Access Control'],
    tags: ['abac', 'authorization', 'policy', 'attributes', 'fine-grained'],
  },
  {
    id: 'authz-3',
    term: 'ACL (Access Control Lists)',
    slug: 'acl',
    category: 'Authentication',
    definition:
      'ACL là danh sách permissions gắn liền với một resource cụ thể. Mỗi entry trong list chỉ định user/group và permissions họ có trên resource đó.',
    details:
      '**ACL Structure:**\n- **Resource**: Object được bảo vệ (file, folder, database record)\n- **ACE (Access Control Entry)**: Individual permission entry\n  - Subject (user/group)\n  - Permissions (read, write, execute)\n  - Allow/Deny flag\n\n**ACL Types:**\n1. **Discretionary ACL**: Resource owner quyết định permissions\n2. **Mandatory ACL**: System-enforced policies (government/military)\n\n**ACL Operations:**\n- Grant permission to user/group\n- Revoke permission from user/group\n- Check permission for subject\n- Inherit permissions (folder -> files)\n\n**Advantages:**\n- Simple và dễ hiểu\n- Per-resource control\n- Flexible permissions\n\n**Disadvantages:**\n- Không scale tốt (large ACLs)\n- Khó quản lý trong systems lớn\n- No context-aware decisions\n- Permission management overhead',
    examples: [
      {
        title: 'ACL Implementation',
        code: `// ACL Structure
interface ACL {
  resourceId: string;
  entries: ACL.Entry[];
}

namespace ACL {
  export interface Entry {
    subject: string; // user ID hoặc group
    type: 'user' | 'group';
    permissions: Permission[];
    effect: 'allow' | 'deny';
  }

  export type Permission = 'read' | 'write' | 'delete' | 'share' | 'admin';
}

// Check if user has permission
function checkPermission(
  acl: ACL,
  userId: string,
  userGroups: string[],
  permission: ACL.Permission
): boolean {
  // Collect all matching entries
  const relevantEntries = acl.entries.filter(entry => {
    if (entry.type === 'user') {
      return entry.subject === userId;
    }
    if (entry.type === 'group') {
      return userGroups.includes(entry.subject);
    }
    return false;
  });

  // Deny entries take precedence
  for (const entry of relevantEntries) {
    if (entry.effect === 'deny' && entry.permissions.includes(permission)) {
      return false;
    }
  }

  // Check for allow
  for (const entry of relevantEntries) {
    if (entry.effect === 'allow' && entry.permissions.includes(permission)) {
      return true;
    }
  }

  // Default deny
  return false;
}

// Database-backed ACL
app.get('/files/:id', async (req, res) => {
  const file = await db.files.findById(req.params.id);

  // Load ACL
  const acl = await db.acl.findFirst({
    where: { resourceId: file.id },
    include: { entries: true }
  });

  if (!acl) {
    return res.status(403).json({ error: 'No ACL defined' });
  }

  // Check permission
  const hasAccess = checkPermission(
    acl,
    req.user.id,
    req.user.groups,
    'read'
  );

  if (!hasAccess) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(file);
});

// Grant permission
app.post('/files/:id/acl', async (req, res) => {
  const { userId, permission } = req.body;

  await db.aclEntry.create({
    data: {
      aclId: req.params.id,
      subject: userId,
      type: 'user',
      permissions: [permission],
      effect: 'allow'
    }
  });

  res.status(201).json({ success: true });
});`,
        explanation:
          'ACL gắn permissions trực tiếp với resource. Deny entries có priority cao nhất. Simple nhưng không scale tốt với many users.',
      },
    ],
    relatedTerms: ['Authorization', 'RBAC', 'Permissions', 'Access Control', 'Security'],
    tags: ['acl', 'authorization', 'permissions', 'access-control', 'security'],
  },
]
