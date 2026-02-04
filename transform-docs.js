#!/usr/bin/env node
/**
 * Transform TypeDoc JSON output to AppGram SDK docs format
 * Usage: node transform-docs.js
 */

const fs = require('fs');
const path = require('path');

// TypeDoc kind constants
const TypeDocKind = {
  Class: 128,
  Interface: 256,
  Function: 64,
  TypeAlias: 2097152,
  Method: 2048,
  Property: 1024,
  Constructor: 512,
};

// Read the TypeDoc JSON
const inputPath = path.join(__dirname, 'docs.json');
const outputPath = path.join(__dirname, 'react-sdk.json');

const typeDocData = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

// Helper to extract type string from TypeDoc type
function typeToString(type) {
  if (!type) return 'any';

  switch (type.type) {
    case 'intrinsic':
      return type.name;
    case 'literal':
      return typeof type.value === 'string' ? `'${type.value}'` : String(type.value);
    case 'reference':
      if (type.typeArguments) {
        return `${type.name}<${type.typeArguments.map(typeToString).join(', ')}>`;
      }
      return type.name;
    case 'union':
      return type.types.map(typeToString).join(' | ');
    case 'array':
      return `${typeToString(type.elementType)}[]`;
    case 'reflection':
      if (type.declaration?.signatures) {
        const sig = type.declaration.signatures[0];
        const params = (sig.parameters || [])
          .map(p => `${p.name}: ${typeToString(p.type)}`)
          .join(', ');
        const returnType = typeToString(sig.type);
        return `(${params}) => ${returnType}`;
      }
      return 'object';
    case 'intersection':
      return type.types.map(typeToString).join(' & ');
    case 'tuple':
      return `[${type.elements.map(typeToString).join(', ')}]`;
    default:
      return type.name || 'unknown';
  }
}

// Extract comment text
function extractComment(comment) {
  if (!comment) return null;

  const summary = comment.summary
    ?.map(part => part.text || '')
    .join('') || null;

  const result = { summary };

  if (comment.blockTags) {
    comment.blockTags.forEach(tag => {
      const tagName = tag.tag.replace('@', '');
      const content = tag.content
        ?.map(part => part.text || '')
        .join('');

      // For code examples, strip the markdown code fences but preserve the code
      if (tagName === 'example') {
        result.example = content.replace(/```\w*\n?|\n?```/g, '').trim();
      } else if (tagName === 'default') {
        // Clean up default values - remove code fences
        result.defaultValue = content.replace(/```\w*\n?|\n?```/g, '').trim();
      } else if (tagName === 'returns') {
        result.returns = content.trim();
      } else if (tagName === 'throws') {
        result.throws = content.trim();
      } else if (tagName === 'see') {
        result.see = content.trim();
      } else if (tagName === 'deprecated') {
        result.deprecated = content.trim() || true;
      } else {
        result[tagName] = content.trim();
      }
    });
  }

  return result;
}

// Categorize items
function categorizeItems(children) {
  const categories = {
    provider: [],
    client: [],
    components: [],
    hooks: [],
    types: [],
    enums: [],
    utilities: [],
  };

  children.forEach(item => {
    const name = item.name;

    if (name === 'AppgramProvider') {
      categories.provider.push(item);
    } else if (name === 'AppgramClient') {
      categories.client.push(item);
    } else if (name.startsWith('use')) {
      categories.hooks.push(item);
    } else if (item.kind === TypeDocKind.Function && !name.startsWith('use') &&
               name !== 'cn' && name !== 'getFingerprint' && name !== 'resetFingerprint') {
      // React components are functions that start with capital letter
      if (name[0] === name[0].toUpperCase()) {
        categories.components.push(item);
      } else {
        categories.utilities.push(item);
      }
    } else if (item.kind === TypeDocKind.Interface) {
      categories.types.push(item);
    } else if (item.kind === TypeDocKind.TypeAlias) {
      categories.enums.push(item);
    } else if (item.kind === TypeDocKind.Function) {
      categories.utilities.push(item);
    }
  });

  return categories;
}

// Transform a class (AppgramClient)
function transformClass(item) {
  const result = {
    kind: 'class',
    name: item.name,
    access: 'public',
    description: extractComment(item.comment),
    declaration: `class ${item.name}`,
    methods: [],
    properties: [],
    initializers: [],
  };

  if (item.children) {
    item.children.forEach(child => {
      if (child.kind === TypeDocKind.Constructor) {
        const sig = child.signatures?.[0];
        if (sig) {
          result.initializers.push({
            name: 'constructor',
            access: 'public',
            isStatic: false,
            isAsync: false,
            throws: false,
            declaration: `constructor(${(sig.parameters || []).map(p => `${p.name}: ${typeToString(p.type)}`).join(', ')})`,
            description: extractComment(sig.comment),
            parameters: (sig.parameters || []).map(p => ({
              name: p.name,
              type: typeToString(p.type),
              description: extractComment(p.comment),
            })),
          });
        }
      } else if (child.kind === TypeDocKind.Method) {
        const sig = child.signatures?.[0];
        if (sig) {
          const isAsync = sig.type?.type === 'reference' && sig.type?.name === 'Promise';
          result.methods.push({
            name: child.name,
            access: child.flags?.isPrivate ? 'private' : 'public',
            isStatic: !!child.flags?.isStatic,
            isAsync,
            throws: false,
            declaration: `${isAsync ? 'async ' : ''}${child.name}(${(sig.parameters || []).map(p => `${p.name}${p.flags?.isOptional ? '?' : ''}: ${typeToString(p.type)}`).join(', ')}): ${typeToString(sig.type)}`,
            description: extractComment(sig.comment),
            parameters: (sig.parameters || []).map(p => ({
              name: p.name,
              type: typeToString(p.type),
              optional: !!p.flags?.isOptional,
              description: extractComment(p.comment),
            })),
            returnType: typeToString(sig.type),
          });
        }
      } else if (child.kind === TypeDocKind.Property) {
        result.properties.push({
          name: child.name,
          type: typeToString(child.type),
          isStatic: !!child.flags?.isStatic,
          access: child.flags?.isPrivate ? 'private' : 'public',
          declaration: `${child.name}: ${typeToString(child.type)}`,
          description: extractComment(child.comment),
        });
      }
    });
  }

  return result;
}

// Transform an interface
function transformInterface(item) {
  const result = {
    kind: 'interface',
    name: item.name,
    access: 'public',
    description: extractComment(item.comment),
    declaration: `interface ${item.name}`,
    properties: [],
  };

  if (item.children) {
    item.children.forEach(child => {
      if (child.kind === TypeDocKind.Property) {
        result.properties.push({
          name: child.name,
          type: typeToString(child.type),
          isStatic: false,
          access: 'public',
          optional: !!child.flags?.isOptional,
          declaration: `${child.name}${child.flags?.isOptional ? '?' : ''}: ${typeToString(child.type)}`,
          description: extractComment(child.comment),
        });
      }
    });
  }

  return result;
}

// Transform a function (component or hook)
function transformFunction(item, isHook = false, isComponent = false) {
  const sig = item.signatures?.[0];
  if (!sig) return null;

  // Clean up parameter names - replace __namedParameters with meaningful names
  const cleanParams = (sig.parameters || []).map(p => {
    let name = p.name;
    // Replace __namedParameters with 'props' for components or 'options' for hooks
    if (name === '__namedParameters') {
      if (isComponent) {
        name = 'props';
      } else if (isHook) {
        name = 'options';
      } else {
        // Try to derive name from type (e.g., AppgramProviderProps -> props)
        const typeName = typeToString(p.type);
        if (typeName.endsWith('Props')) {
          name = 'props';
        } else if (typeName.endsWith('Options')) {
          name = 'options';
        } else if (typeName.endsWith('Config')) {
          name = 'config';
        } else {
          name = 'params';
        }
      }
    }
    return { ...p, name };
  });

  const result = {
    kind: isHook ? 'hook' : isComponent ? 'component' : 'function',
    name: item.name,
    access: 'public',
    description: extractComment(sig.comment),
    declaration: `function ${item.name}(${cleanParams.map(p => `${p.name}${p.flags?.isOptional ? '?' : ''}: ${typeToString(p.type)}`).join(', ')}): ${typeToString(sig.type)}`,
    parameters: cleanParams.map(p => ({
      name: p.name,
      type: typeToString(p.type),
      optional: !!p.flags?.isOptional,
      description: extractComment(p.comment),
    })),
    returnType: typeToString(sig.type),
  };

  return result;
}

// Transform a type alias
function transformTypeAlias(item) {
  let values = [];

  if (item.type?.type === 'union') {
    values = item.type.types
      .filter(t => t.type === 'literal')
      .map(t => t.value);
  }

  return {
    kind: 'type',
    name: item.name,
    access: 'public',
    description: extractComment(item.comment),
    declaration: `type ${item.name} = ${typeToString(item.type)}`,
    values,
  };
}

// Main transformation
function transformDocs(typeDocData) {
  const categories = categorizeItems(typeDocData.children || []);

  const types = [];
  const navigation = {
    categories: [],
  };

  // Provider
  if (categories.provider.length > 0) {
    const providerTypes = categories.provider.map(item => transformFunction(item, false, true));
    types.push(...providerTypes.filter(Boolean));
    navigation.categories.push({
      title: 'Provider',
      items: categories.provider.map(i => i.name),
    });
  }

  // Client
  if (categories.client.length > 0) {
    const clientTypes = categories.client.map(transformClass);
    types.push(...clientTypes);
    navigation.categories.push({
      title: 'Client',
      items: categories.client.map(i => i.name),
    });
  }

  // Hooks
  if (categories.hooks.length > 0) {
    const hookTypes = categories.hooks.map(item => transformFunction(item, true));
    types.push(...hookTypes.filter(Boolean));
    navigation.categories.push({
      title: 'Hooks',
      items: categories.hooks.map(i => i.name),
    });
  }

  // Components
  if (categories.components.length > 0) {
    const componentTypes = categories.components.map(item => transformFunction(item, false, true));
    types.push(...componentTypes.filter(Boolean));
    navigation.categories.push({
      title: 'Components',
      items: categories.components.map(i => i.name),
    });
  }

  // Types - group by feature
  const typeGroups = {
    'Wish Types': [],
    'Help Center Types': [],
    'Release Types': [],
    'Roadmap Types': [],
    'Status Types': [],
    'Support Types': [],
    'Common Types': [],
  };

  categories.types.forEach(item => {
    const name = item.name;
    if (name.includes('Wish') || name.includes('Vote')) {
      typeGroups['Wish Types'].push(item);
    } else if (name.includes('Help') || name.includes('Article') || name.includes('Collection')) {
      typeGroups['Help Center Types'].push(item);
    } else if (name.includes('Release')) {
      typeGroups['Release Types'].push(item);
    } else if (name.includes('Roadmap')) {
      typeGroups['Roadmap Types'].push(item);
    } else if (name.includes('Status') || name.includes('Incident')) {
      typeGroups['Status Types'].push(item);
    } else if (name.includes('Support') || name.includes('Ticket')) {
      typeGroups['Support Types'].push(item);
    } else {
      typeGroups['Common Types'].push(item);
    }
  });

  Object.entries(typeGroups).forEach(([groupName, items]) => {
    if (items.length > 0) {
      const transformedTypes = items.map(transformInterface);
      types.push(...transformedTypes);
      navigation.categories.push({
        title: groupName,
        items: items.map(i => i.name),
      });
    }
  });

  // Enums
  if (categories.enums.length > 0) {
    const enumTypes = categories.enums.map(transformTypeAlias);
    types.push(...enumTypes);
    navigation.categories.push({
      title: 'Enums',
      items: categories.enums.map(i => i.name),
    });
  }

  // Utilities
  if (categories.utilities.length > 0) {
    const utilityTypes = categories.utilities.map(item => transformFunction(item));
    types.push(...utilityTypes.filter(Boolean));
    navigation.categories.push({
      title: 'Utilities',
      items: categories.utilities.map(i => i.name),
    });
  }

  return {
    schemaVersion: '1.0',
    metadata: {
      sdkName: '@appgram/react',
      platform: 'web',
      language: 'TypeScript',
      generatedAt: new Date().toISOString(),
    },
    modules: [{
      name: '@appgram/react',
      types,
    }],
    navigation,
  };
}

// Run transformation
const result = transformDocs(typeDocData);
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));

console.log(`Transformed ${typeDocData.children?.length || 0} items`);
console.log(`Output written to ${outputPath}`);
console.log('\nCategories:');
result.navigation.categories.forEach(cat => {
  console.log(`  - ${cat.title}: ${cat.items.length} items`);
});
