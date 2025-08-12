console.log('AR Code-Verse script loaded!');

let functionDeclarations = {};
let functionCalls = [];

document.addEventListener('DOMContentLoaded', () => {
    const scene = document.querySelector('a-scene');
    const codeInput = document.getElementById('code-input');
    const visualizeBtn = document.getElementById('visualize-btn');
    const closeButton = document.getElementById('close-button');
    const detailsPanel = document.getElementById('details-panel');
    const languageSelect = document.getElementById('language-select');
    const fileUpload = document.getElementById('file-upload');
    const loader = document.getElementById('loader');

    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                codeInput.value = e.target.result;
                const extension = file.name.split('.').pop();
                switch(extension) {
                    case 'js':
                        languageSelect.value = 'javascript';
                        break;
                    case 'html':
                        languageSelect.value = 'html';
                        break;
                    case 'py':
                        languageSelect.value = 'python';
                        break;
                    case 'css':
                        languageSelect.value = 'css';
                        break;
                    case 'c':
                    case 'cpp':
                        languageSelect.value = 'c_cpp';
                        break;
                    case 'java':
                        languageSelect.value = 'java';
                        break;
                    case 'rb':
                        languageSelect.value = 'ruby';
                        break;
                }
                visualizeBtn.click();
            };
            reader.readAsText(file);
        }
    });

    languageSelect.addEventListener('change', (event) => {
        if (event.target.value === 'html') {
            codeInput.value = `<!DOCTYPE html>
<html>
<head>
    <title>My Page</title>
</head>
<body>
    <h1>Welcome</h1>
    <p>This is a paragraph.</p>
    <img src="image.jpg" alt="An image">
</body>
</html>`;
        } else if (event.target.value === 'javascript') {
            codeInput.value = `function hello() {\n    console.log("World");\n}`;
        } else if (event.target.value === 'python') {
            codeInput.value = `def greet(name):
    print(f"Hello, {name}")

greet("World")`;
        } else if (event.target.value === 'nodejs') {
            codeInput.value = `const http = require('http');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(3000, '127.0.0.1', () => {
  console.log('Server running');
});`;
        } else if (event.target.value === 'css') {
            codeInput.value = `body {\n    font-family: Arial, sans-serif;\n    color: #333;\n}`;
        } else if (event.target.value === 'c_cpp') {
            codeInput.value = `void main() { 
    int answer = 6 * 7; 
}`;
        } else if (event.target.value === 'java') {
            codeInput.value = `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
        } else if (event.target.value === 'ruby') {
            codeInput.value = `def greet(name)
    puts "Hello, #{name}"
end

greet("World")`;
        }
    });

    visualizeBtn.addEventListener('click', async () => {
        loader.style.display = 'flex';
        setTimeout(() => { // Allow loader to render
            const code = codeInput.value;
            const language = languageSelect.value;
            try {
                functionDeclarations = {};
                functionCalls = [];
                
                const oldAst = scene.querySelector('[ast-root]');
                if (oldAst) oldAst.parentNode.removeChild(oldAst);

                let ast;
                if (language === 'javascript' || language === 'nodejs') {
                    ast = esprima.parseScript(code, { tolerant: true, range: true });
                } else if (language === 'html') {
                    const parser = new DOMParser();
                    const dom = parser.parseFromString(code, "text/html");
                    ast = convertDomToAst(dom.body); 
                } else if (language === 'python') {
                    const pythonAst = __BRYTHON__.py2js(code, '__main__').ast;
                    ast = convertPythonAst(pythonAst);
                } else if (language === 'css') {
                    ast = parseCss(code);
                } else if (language === 'c_cpp') {
                    const cparsedAst = cparse(code);
                    ast = convertCParsedAST(cparsedAst);
                } else if (language === 'java') {
                    const javaCst = javaParser.parse(code);
                    ast = convertJavaCst(javaCst);
                } else if (language === 'ruby') {
                    const rubyAst = RubyParser.parse(code);
                    ast = convertRubyAST(rubyAst);
                }

                const astRoot = document.createElement('a-entity');
                astRoot.setAttribute('ast-root', '');

                renderAst(ast, astRoot, { x: 0, y: 3, z: -8 });
                scene.appendChild(astRoot);
                
                drawDependencyLines(scene);

            } catch (e) {
                alert(`Error parsing code: ${e.message}`);
            } finally {
                loader.style.display = 'none';
            }
        }, 100);
    });

    if (closeButton && detailsPanel) {
        closeButton.addEventListener('click', () => {
            detailsPanel.style.display = 'none';
        });
    }

    visualizeBtn.click();
});

function convertJavaCst(cstNode) {
    if (!cstNode) return null;

    let obj = {
        type: cstNode.name,
        children: []
    };

    if (cstNode.children) {
        for (const key in cstNode.children) {
            const children = cstNode.children[key];
            if (Array.isArray(children)) {
                children.forEach(child => {
                    if (child.name) { // It's a CSTNode
                        obj.children.push(convertJavaCst(child));
                    } else { // It's a Token
                        obj.children.push({
                            type: child.tokenType.name,
                            value: child.image
                        });
                    }
                });
            }
        }
    }

    return obj;
}

function convertRubyAST(rubyNode) {
    if (!rubyNode || !Array.isArray(rubyNode)) return null;

    const type = rubyNode[0];
    const children = rubyNode.slice(1).map(convertRubyAST).filter(c => c);

    let obj = { type };
    if (children.length > 0) {
        obj.children = children;
    }

    // Heuristics to make the graph more readable
    if (['int', 'float', 'str', 'sym'].includes(type)) {
        obj.value = rubyNode[1];
        delete obj.children;
    } else if (['lvasgn', 'ivasgn', 'cvasgn', 'gvasgn'].includes(type)) {
        obj.name = rubyNode[1];
        if (rubyNode[2]) {
            obj.children = [convertRubyAST(rubyNode[2])];
        } else {
            delete obj.children;
        }
    } else if (['lvar', 'ivar', 'cvar', 'gvar'].includes(type)) {
        obj.name = rubyNode[1];
        delete obj.children;
    }


    return obj;
}


function convertCParsedAST(cparsedNode) {
    if (!cparsedNode) return null;

    let obj = {};
    obj.type = cparsedNode.type;

    for (const key in cparsedNode) {
        if (key === 'type' || key === 'pos') continue;

        const value = cparsedNode[key];
        if (Array.isArray(value)) {
            obj[key] = value.map(item => convertCParsedAST(item)).filter(item => item !== null);
        } else if (typeof value === 'object' && value !== null && value.type) {
            obj[key] = convertCParsedAST(value);
        } else {
            obj[key] = value;
        }
    }

    if(Array.isArray(cparsedNode)) {
        return cparsedNode.map(node => convertCParsedAST(node));
    }

    return obj;
}


function parseCss(code) {
    const rules = [];
    // A simple regex-based parser for CSS. A proper parser would be better for complex cases.
    const regex = /([^{]+)\s*\{([^}]+)\}/g;
    let match;
    while ((match = regex.exec(code)) !== null) {
        const selector = match[1].trim();
        const properties = match[2].trim().split(';').filter(p => p.trim() !== '').map(p => {
            const parts = p.split(':');
            return {
                type: 'Property',
                name: parts[0].trim(),
                value: parts[1].trim()
            };
        });
        rules.push({
            type: 'Rule',
            selector: selector,
            children: properties
        });
    }
    return { type: 'StyleSheet', children: rules };
}


function convertDomToAst(domNode) {
    let obj = {};

    obj.type = domNode.nodeName;

    if (domNode.nodeType === 3) { 
        obj.type = 'text';
        obj.value = domNode.nodeValue.trim();
        if (!obj.value) return null;
    } else if (domNode.nodeType === 1) { 
        if (domNode.attributes.length > 0) {
            obj.attributes = {};
            for(let i = 0; i < domNode.attributes.length; i++) {
                const attr = domNode.attributes[i];
                obj.attributes[attr.name] = attr.value;
            }
        }
    }

    if (domNode.childNodes.length > 0) {
        obj.children = [];
        for (let i = 0; i < domNode.childNodes.length; i++) {
            const childNode = domNode.childNodes[i];
            const childObj = convertDomToAst(childNode);
            if (childObj) {
                obj.children.push(childObj);
            }
        }
    }

    return obj;
}

function convertPythonAst(pyNode) {
    if (!pyNode) return null;

    let obj = {};
    obj.type = pyNode.constructor.name;

    if (pyNode._fields) {
        pyNode._fields.forEach(field => {
            const value = pyNode[field];
            if (Array.isArray(value)) {
                obj[field] = value.map(item => convertPythonAst(item)).filter(item => item !== null);
            } else if (typeof value === 'object' && value !== null && value.constructor.name !== 'Object') {
                obj[field] = convertPythonAst(value);
            } else {
                obj[field] = value;
            }
        });
    }

    // Attempt to extract a simple value if possible for cleaner visualization
    if (pyNode.id) obj.name = pyNode.id;
    if (pyNode.name) obj.name = pyNode.name;
    if (pyNode.arg) obj.name = pyNode.arg;
    if (pyNode.s) obj.value = pyNode.s;
    if (pyNode.n) obj.value = pyNode.n;


    return obj;
}


function drawDependencyLines(scene) {
    setTimeout(() => {
        const astRoot = scene.querySelector('[ast-root]');
        if (!astRoot) return;

        functionCalls.forEach(call => {
            const declarationPos = functionDeclarations[call.name];
            if (declarationPos) {
                const line = document.createElement('a-entity');
                
                // Convert world positions to local positions relative to the astRoot
                const localStart = astRoot.object3D.worldToLocal(call.position.clone());
                const localEnd = astRoot.object3D.worldToLocal(declarationPos.clone());

                line.setAttribute('line', {
                    start: localStart,
                    end: localStart, // Start and end at the same point initially
                    color: '#FFD700',
                    opacity: 0.8
                });

                // Add an animation to make the line "grow"
                line.setAttribute('animation', {
                    property: 'line.end',
                    to: { x: localEnd.x, y: localEnd.y, z: localEnd.z },
                    dur: 1500,
                    easing: 'easeOutQuad'
                });

                astRoot.appendChild(line);
            }
        });
    }, 500);
}

function renderAst(node, parentElement, position, parentNode = null) {
    if (!node || !node.type) return;

    const entity = document.createElement('a-entity');
    entity.setAttribute('position', position);
    entity.setAttribute('interactive', '');
    entity.setAttribute('grabbable', ''); // Make nodes grabbable
    entity.setAttribute('droppable', ''); // Make nodes droppable
    entity.nodeData = node;
    entity.parentNodeData = parentNode;

    parentElement.appendChild(entity);

    setTimeout(() => {
        const worldPosition = new THREE.Vector3();
        entity.object3D.getWorldPosition(worldPosition);

        const language = document.getElementById('language-select').value;

        if (language === 'javascript' || language === 'nodejs') {
            if (node.type === 'FunctionDeclaration' && node.id) {
                functionDeclarations[node.id.name] = worldPosition;
            } else if (node.type === 'CallExpression' && node.callee.name) {
                functionCalls.push({ name: node.callee.name, position: worldPosition });
            }
        } else if (language === 'python') {
            if (node.type === 'FunctionDef' && node.name) {
                functionDeclarations[node.name] = worldPosition;
            } else if (node.type === 'Call' && node.func && node.func.type === 'Name' && node.func.name) {
                functionCalls.push({ name: node.func.name, position: worldPosition });
            }
        } else if (language === 'c_cpp') {
            if (node.type === 'FunctionDeclaration' && node.name) {
                functionDeclarations[node.name] = worldPosition;
            } else if (node.type === 'CallExpression' && node.base && node.base.type === 'Identifier') {
                functionCalls.push({ name: node.base.value, position: worldPosition });
            }
        } else if (language === 'java') {
            if (node.type === 'methodDeclaration' && node.children) {
                const header = node.children.find(c => c.type === 'methodHeader');
                if (header && header.children) {
                    const declarator = header.children.find(c => c.type === 'methodDeclarator');
                    if(declarator && declarator.children) {
                        const identifier = declarator.children.find(c => c.type === 'Identifier');
                        if (identifier) {
                           functionDeclarations[identifier.value] = worldPosition;
                        }
                    }
                }
            } else if (node.type === 'methodInvocation' && node.children) {
                const identifier = node.children.find(c => c.type === 'Identifier');
                if (identifier) {
                    functionCalls.push({ name: identifier.value, position: worldPosition });
                }
            }
        } else if (language === 'ruby') {
            if (node.type === 'def' && node.children && node.children[0] && typeof node.children[0] === 'string') {
                functionDeclarations[node.children[0]] = worldPosition;
            } else if (node.type === 'send' && node.children && node.children[1] && typeof node.children[1] === 'string') {
                const callNode = node.children[0];
                const methodName = node.children[1];
                // Only track calls to methods defined in the script
                if (callNode === null || (callNode.type === 'self')) {
                     functionCalls.push({ name: methodName, position: worldPosition });
                }
            }
        }
    }, 0);

    const shape = getShapeForNode(node.type);
    shape.setAttribute('color', getNodeColor(node.type));
    // Mark clickable for mouse raycaster; keep grabbable only on the parent entity
    shape.classList.add('clickable');
    // Bubble clicks from mesh to the owning entity for unified handling
    shape.addEventListener('click', () => entity.emit('click'));
    entity.appendChild(shape);

    const text = document.createElement('a-text');
    text.setAttribute('value', `${node.type}${node.name ? `\n(${node.name})` : ''}${node.value ? `\n(${node.value})` : ''}`);
    text.setAttribute('align', 'center');
    text.setAttribute('position', '0 -0.4 0');
    text.setAttribute('scale', '0.5 0.5 0.5');
    // Make label also clickable to improve UX; do not make it grabbable
    text.classList.add('clickable');
    text.addEventListener('click', () => entity.emit('click'));
    entity.appendChild(text);

    const children = getChildren(node);
    children.forEach((child, index) => {
        const childPosition = getChildPosition(index, children.length);
        renderAst(child, entity, childPosition, node);
        const line = document.createElement('a-entity');
        line.setAttribute('line', { start: '0 0 0', end: `${childPosition.x} ${childPosition.y} ${childPosition.z}`, color: '#FFF' });
        entity.appendChild(line);
    });
}

function getShapeForNode(type) {
    const shape = document.createElement('a-entity');
    switch (type) {
        case 'FunctionDeclaration':
        case 'FunctionDef':
            shape.setAttribute('geometry', 'primitive: cylinder; radius: 0.25; height: 0.3');
            break;
        case 'VariableDeclaration':
        case 'Assign':
            shape.setAttribute('geometry', 'primitive: box; width: 0.4; height: 0.4; depth: 0.4');
            break;
        case 'CallExpression':
        case 'Call':
            shape.setAttribute('geometry', 'primitive: cone; radiusBottom: 0.25; radiusTop: 0; height: 0.4');
            break;
        case 'ReturnStatement':
        case 'Rule':
            shape.setAttribute('geometry', 'primitive: octahedron; radius: 0.25');
            break;
        default:
            shape.setAttribute('geometry', 'primitive: sphere; radius: 0.2');
            break;
    }
    return shape;
}


function getChildren(node) {
    let children = [];
    if (!node) return children;

    // A more generic way to discover children
    for (const key in node) {
        if (key === 'parentNode' || key === 'parent') continue; // Avoid circular references

        const value = node[key];
        if (Array.isArray(value)) {
            for (const item of value) {
                if (item && typeof item === 'object' && item.type) {
                    children.push(item);
                }
            }
        } else if (value && typeof value === 'object' && value.type) {
            children.push(value);
        }
    }

    return children.filter((child, index, self) =>
        child && child.type && self.indexOf(child) === index
    );
}

function getNodeColor(type) {
    switch (type) {
        // JavaScript
        case 'FunctionDeclaration': return '#FFC65D';
        case 'VariableDeclaration': return '#4CC3D9';
        case 'ReturnStatement': return '#EF2D5E';
        case 'CallExpression': return '#7BC8A4';
        case 'A':
        case 'P':
        case 'DIV':
        case 'SPAN':
        case 'H1':
        case 'H2':
        case 'H3': return '#5A9BD5';
        case 'IMG':
        case 'SCRIPT':
        case 'LINK': return '#70AD47';
        case 'BODY':
        case 'HTML': return '#ED7D31';
        
        // Python
        case 'Module': return '#3572A5';
        case 'FunctionDef': return '#FFC65D';
        case 'Assign': return '#4CC3D9';
        case 'Call': return '#7BC8A4';
        case 'Constant': return '#9B59B6';
        case 'Name': return '#F1C40F';
        
        // CSS
        case 'StyleSheet': return '#1E90FF';
        case 'Rule': return '#6A5ACD';
        case 'Property': return '#20B2AA';

        // C/C++
        case 'GlobalVariableDeclaration': return '#f39c12';
        case 'Type': return '#d35400';
        case 'BinaryExpression': return '#c0392b';
        case 'Literal': return '#bdc3c7';

        // Java
        case 'ordinaryCompilationUnit': return '#f1c40f';
        case 'typeDeclaration': return '#f39c12';
        case 'classDeclaration': return '#e67e22';
        case 'classBody': return '#d35400';
        case 'methodDeclaration': return '#c0392b';
        case 'methodHeader': return '#a52a2a';
        case 'methodDeclarator': return '#800000';
        case 'formalParameterList': return '#e74c3c';
        case 'formalParameter': return '#c0392b';
        case 'unannType': return '#9b59b6';
        case 'unannReferenceType': return '#8e44ad';
        case 'unannClassOrInterfaceType': return '#2980b9';
        case 'Identifier': return '#3498db';
        case 'methodBody': return '#1abc9c';
        case 'block': return '#16a085';
        case 'blockStatements': return '#2ecc71';
        case 'blockStatement': return '#27ae60';
        case 'statement': return '#34495e';
        case 'expressionStatement': return '#2c3e50';
        case 'methodInvocation': return '#95a5a6';
        case 'primary': return '#7f8c8d';
        case 'literal': return '#bdc3c7';
        case 'StringLiteral': return '#2ecc71';

        // Ruby
        case 'send': return '#16a085';
        case 'int': return '#27ae60';
        case 'str': return '#2ecc71';
        case 'lvasgn': return '#f39c12';
        case 'def': return '#d35400';
        case 'args': return '#c0392b';

        default: return '#999';
    }
}

function getChildPosition(index, total) {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 1.5;
    const x = radius * Math.cos(angle);
    const y = -1;
    const z = radius * Math.sin(angle);
    return { x, y, z };
}

AFRAME.registerComponent('interactive', {
    init: function () {
        this.el.addEventListener('mouseenter', () => {
            // Highlight node shape without scaling to avoid cursor flicker
            const shape = this.el.querySelector('[geometry]');
            if (shape) {
                if (!shape.getAttribute('data-hover-original-color')) {
                    const currentColor = shape.getAttribute('color') || '#999';
                    shape.setAttribute('data-hover-original-color', currentColor);
                }
                shape.setAttribute('color', '#FFD700');
            }

            // Highlight parent connection
            if (this.el.parentNode && this.el.parentNode.components.line) {
                this.el.parentNode.components.line.el.setAttribute('line', 'color', '#FF5733');
            }
            // Highlight children connections
            this.el.childNodes.forEach(child => {
                if (child.components && child.components.line) {
                    child.setAttribute('line', 'color', '#33FF57');
                }
            });
        });

        this.el.addEventListener('mouseleave', () => {
            // Restore node shape color
            const shape = this.el.querySelector('[geometry]');
            if (shape) {
                const original = shape.getAttribute('data-hover-original-color');
                if (original) {
                    shape.setAttribute('color', original);
                    shape.removeAttribute('data-hover-original-color');
                }
            }

            // Restore parent connection color
            if (this.el.parentNode && this.el.parentNode.components.line) {
                this.el.parentNode.components.line.el.setAttribute('line', 'color', '#FFF');
            }
            // Restore children connection color
            this.el.childNodes.forEach(child => {
                if (child.components && child.components.line) {
                    child.setAttribute('line', 'color', '#FFF');
                }
            });
        });

        const cleanupHighlights = () => {
            document.querySelectorAll('[grabbable]').forEach(nodeEl => {
                const originalColor = nodeEl.getAttribute('data-original-color');
                if (originalColor) {
                    const shape = nodeEl.querySelector('[geometry]');
                    if (shape) {
                        shape.setAttribute('color', originalColor);
                    }
                    nodeEl.removeAttribute('data-original-color');
                }
            });
        };

        this.el.addEventListener('drag-start', () => {
            // Highlight potential drop targets
            document.querySelectorAll('[grabbable]').forEach(nodeEl => {
                if (nodeEl !== this.el) {
                    const nodeData = nodeEl.nodeData;
                    // A valid drop target is a node that can contain a list of statements.
                    if (nodeData && Array.isArray(nodeData.body)) {
                        const shape = nodeEl.querySelector('[geometry]');
                        if (shape) {
                            nodeEl.setAttribute('data-original-color', shape.getAttribute('color'));
                            shape.setAttribute('color', '#33FF57'); // Highlight color: green
                        }
                    }
                }
            });
        });

        this.el.addEventListener('drag-end', cleanupHighlights);

        this.el.addEventListener('drag-drop', (evt) => {
            cleanupHighlights();
            const droppedOnEl = evt.detail.dropped;
            
            if (droppedOnEl && droppedOnEl.nodeData && this.el.nodeData) {
                const draggedNode = this.el.nodeData;
                const oldParentNode = this.el.parentNodeData;
                const newParentNode = droppedOnEl.nodeData;
                
                if (oldParentNode) {
                    for (const key in oldParentNode) {
                        if (Array.isArray(oldParentNode[key])) {
                            const index = oldParentNode[key].indexOf(draggedNode);
                            if (index > -1) {
                                oldParentNode[key].splice(index, 1);
                                break; 
                            }
                        }
                    }
                }

                if (newParentNode.body && Array.isArray(newParentNode.body)) {
                    newParentNode.body.push(draggedNode);
                } else if(newParentNode.type === 'Program') { // Handle dropping onto the root
                    if (!newParentNode.body) newParentNode.body = [];
                    newParentNode.body.push(draggedNode);
                }
                
                const astRootEntity = document.querySelector('[ast-root]');
                if (astRootEntity && astRootEntity.childNodes.length > 0) {
                    const rootAst = astRootEntity.childNodes[0].nodeData;
                    updateCodeFromAst(rootAst);
                    // Refresh visualization
                    document.getElementById('visualize-btn').click();
                }
            }
        });


        this.el.addEventListener('click', () => {
            const detailsPanel = document.getElementById('details-panel');
            const detailsContent = document.getElementById('details-content');
            if (detailsPanel && detailsContent) {
                const nodeData = this.el.nodeData;
                const parentData = this.el.parentNodeData;
                const worldPos = new THREE.Vector3();
                this.el.object3D.getWorldPosition(worldPos);
                const children = getChildren(nodeData);
                const lang = document.getElementById('language-select').value;
                const summarizeChildTypes = children.map(c => c.type).join(', ');
                
                let detailsHtml = `<h3>${nodeData.type}</h3>`;

                const createInputField = (key, value) => {
                    return `
                        <div>
                            <label for="edit-${key}">${key}:</label>
                            <input type="text" id="edit-${key}" value="${value ?? ''}" data-key="${key}">
                        </div>
                    `;
                };
                
                if (nodeData.type === 'Identifier' || nodeData.type === 'FunctionDeclaration') {
                    detailsHtml += createInputField('name', nodeData.name || (nodeData.id ? nodeData.id.name : ''));
                }
                
                if (nodeData.type === 'Literal' && typeof nodeData.value !== 'object') {
                    detailsHtml += createInputField('value', nodeData.value);
                }

                // Quick facts
                detailsHtml += `
                    <p><strong>Language:</strong> ${lang}</p>
                    <p><strong>World Position:</strong> x=${worldPos.x.toFixed(3)} y=${worldPos.y.toFixed(3)} z=${worldPos.z.toFixed(3)}</p>
                    <p><strong>Parent Type:</strong> ${parentData ? parentData.type : '(none)'}</p>
                    <p><strong>Children:</strong> ${children.length}${children.length ? ` — ${summarizeChildTypes}` : ''}</p>
                `;

                if (nodeData.name) {
                    detailsHtml += `<p><strong>Name:</strong> ${nodeData.name}</p>`;
                }
                if (nodeData.value) {
                    detailsHtml += `<p><strong>Value:</strong> ${nodeData.value}</p>`;
                }

                if(nodeData.attributes) {
                    detailsHtml += '<h4>Attributes:</h4>';
                    for (const key in nodeData.attributes) {
                        detailsHtml += `<p><strong>${key}:</strong> ${nodeData.attributes[key]}</p>`;
                    }
                }

                // Display simple scalar fields
                for (const key in nodeData) {
                    if (key !== 'type' && key !== 'children' && key !== 'attributes' && key !== 'name' && key !== 'value' && typeof nodeData[key] !== 'object') {
                        detailsHtml += `<p><strong>${key}:</strong> ${nodeData[key]}</p>`;
                    }
                }

                // Show code range snippet for JS/Node if available
                if ((lang === 'javascript' || lang === 'nodejs') && Array.isArray(nodeData.range)) {
                    const [start, end] = nodeData.range;
                    const source = document.getElementById('code-input').value || '';
                    const snippet = source.slice(Math.max(0, start), Math.min(source.length, end));
                    if (snippet) {
                        detailsHtml += `<h4>Source Snippet:</h4><pre style="white-space: pre-wrap; max-height: 200px; overflow:auto;">${escapeHtml(snippet)}</pre>`;
                    }
                }

                // Function relationships (best-effort)
                try {
                    if ((lang === 'javascript' || lang === 'nodejs') && nodeData.type === 'FunctionDeclaration' && nodeData.id && nodeData.id.name) {
                        const fname = nodeData.id.name;
                        const inbound = functionCalls.filter(c => c.name === fname).length;
                        detailsHtml += `<p><strong>Inbound Calls:</strong> ${inbound}</p>`;
                    } else if ((lang === 'javascript' || lang === 'nodejs') && nodeData.type === 'CallExpression' && nodeData.callee && nodeData.callee.name) {
                        const target = nodeData.callee.name;
                        const declared = !!functionDeclarations[target];
                        detailsHtml += `<p><strong>Calls:</strong> ${target} ${declared ? '(declared in this code)' : '(declaration not found)'}</p>`;
                    }
                } catch {}

                // Raw JSON of node
                detailsHtml += `<h4>Raw Node Data:</h4><pre style="white-space: pre-wrap; max-height: 300px; overflow:auto;">${escapeHtml(safeStringify(nodeData, 2))}</pre>`;

                detailsContent.innerHTML = detailsHtml;
                detailsPanel.style.display = 'block';

                detailsContent.querySelectorAll('input[type="text"]').forEach(input => {
                    input.addEventListener('change', (event) => {
                        const key = event.target.getAttribute('data-key');
                        const newValue = event.target.value;

                        if (key === 'name') {
                           if(nodeData.id) nodeData.id.name = newValue;
                           else nodeData.name = newValue;
                        } else if (key === 'value') {
                           nodeData.value = newValue;
                           // Attempt to parse to number if possible
                           if (!isNaN(parseFloat(newValue)) && isFinite(newValue)) {
                                nodeData.value = parseFloat(newValue);
                           }
                        }

                        const astRootEntity = document.querySelector('[ast-root]');
                        if (astRootEntity && astRootEntity.childNodes.length > 0) {
                            const rootAst = astRootEntity.childNodes[0].nodeData;
                            updateCodeFromAst(rootAst);
                            // Refresh visualization
                            document.getElementById('visualize-btn').click();
                        }
                    });
                });
            }
        });
    }
});


function updateCodeFromAst(ast) {
    if (document.getElementById('language-select').value === 'javascript' || document.getElementById('language-select').value === 'nodejs') {
        try {
            const code = escodegen.generate(ast);
            document.getElementById('code-input').value = code;
        } catch(e) {
            console.error("Error generating code:", e);
        }
    }
}

// Utilities for safe rendering
function safeStringify(obj, space = 0) {
  const seen = new WeakSet();
  return JSON.stringify(obj, function(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return '[Circular]';
      seen.add(value);
    }
    return value;
  }, space);
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
