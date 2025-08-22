// Documentation Section Functions

function initDocsSection() {
    console.log('📚 Initializing Documentation section...');
    // Documentation section is mostly static HTML, no special initialization needed
}

async function downloadPostmanCollection() {
    try {
        showNotification('Generiere Postman Collection...', 'info');
        
        const response = await fetch('/docs/api-spec.yaml');
        const yamlContent = await response.text();
        
        // Convert OpenAPI to Postman Collection (simplified)
        const collection = {
            info: {
                name: "Neon Murer CMS API",
                description: "API Collection für das Neon Murer CMS",
                schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            auth: {
                type: "bearer",
                bearer: [
                    {
                        key: "token",
                        value: "{{accessToken}}",
                        type: "string"
                    }
                ]
            },
            variable: [
                {
                    key: "baseUrl",
                    value: window.location.origin + "/api",
                    type: "string"
                },
                {
                    key: "accessToken",
                    value: "",
                    type: "string"
                }
            ],
            item: [
                {
                    name: "Authentication",
                    item: [
                        {
                            name: "Login",
                            request: {
                                method: "POST",
                                header: [
                                    {
                                        key: "Content-Type",
                                        value: "application/json"
                                    }
                                ],
                                body: {
                                    mode: "raw",
                                    raw: JSON.stringify({
                                        email: "admin@neonmurer.ch",
                                        password: "your_password"
                                    }, null, 2)
                                },
                                url: {
                                    raw: "{{baseUrl}}/auth/login",
                                    host: ["{{baseUrl}}"],
                                    path: ["auth", "login"]
                                }
                            }
                        }
                    ]
                },
                {
                    name: "Customers",
                    item: [
                        {
                            name: "Get All Customers",
                            request: {
                                method: "GET",
                                header: [],
                                url: {
                                    raw: "{{baseUrl}}/customers?includeContacts=true",
                                    host: ["{{baseUrl}}"],
                                    path: ["customers"],
                                    query: [
                                        {
                                            key: "includeContacts",
                                            value: "true"
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                },
                {
                    name: "Media",
                    item: [
                        {
                            name: "Get All Media",
                            request: {
                                method: "GET",
                                header: [],
                                url: {
                                    raw: "{{baseUrl}}/media",
                                    host: ["{{baseUrl}}"],
                                    path: ["media"]
                                }
                            }
                        }
                    ]
                },
                {
                    name: "Analytics",
                    item: [
                        {
                            name: "Get Dashboard Data",
                            request: {
                                method: "GET",
                                header: [],
                                url: {
                                    raw: "{{baseUrl}}/analytics/dashboard?period=month",
                                    host: ["{{baseUrl}}"],
                                    path: ["analytics", "dashboard"],
                                    query: [
                                        {
                                            key: "period",
                                            value: "month"
                                        }
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        };
        
        // Download as JSON file
        const blob = new Blob([JSON.stringify(collection, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'neon-murer-cms-api.postman_collection.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Postman Collection erfolgreich heruntergeladen!', 'success');
    } catch (error) {
        console.error('Error downloading Postman collection:', error);
        showNotification('Fehler beim Generieren der Postman Collection', 'error');
    }
}

async function showSystemInfo() {
    try {
        const response = await fetch('/api/health', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch system info');
        }
        
        const healthData = await response.json();
        
        const systemInfo = {
            system: healthData,
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                platform: navigator.platform,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine
            },
            screen: {
                width: screen.width,
                height: screen.height,
                colorDepth: screen.colorDepth,
                pixelDepth: screen.pixelDepth
            },
            window: {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio
            },
            timestamp: new Date().toISOString()
        };
        
        // Show in modal
        const modal = `
            <div class="modal fade" id="systemInfoModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title"><i class="fas fa-info-circle me-2"></i>System-Informationen</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <pre class="bg-light p-3 rounded" style="max-height: 400px; overflow-y: auto; font-size: 12px;">${JSON.stringify(systemInfo, null, 2)}</pre>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" onclick="copySystemInfo()">
                                <i class="fas fa-copy me-2"></i>In Zwischenablage kopieren
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('systemInfoModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to page
        document.body.insertAdjacentHTML('beforeend', modal);
        
        // Store system info globally for copy function
        window.currentSystemInfo = systemInfo;
        
        // Show modal
        const modalElement = new bootstrap.Modal(document.getElementById('systemInfoModal'));
        modalElement.show();
        
    } catch (error) {
        console.error('Error fetching system info:', error);
        showNotification('Fehler beim Abrufen der System-Informationen', 'error');
    }
}

function copySystemInfo() {
    if (window.currentSystemInfo) {
        navigator.clipboard.writeText(JSON.stringify(window.currentSystemInfo, null, 2)).then(() => {
            showNotification('System-Informationen in Zwischenablage kopiert!', 'success');
        }).catch(err => {
            console.error('Could not copy text: ', err);
            showNotification('Fehler beim Kopieren in die Zwischenablage', 'error');
        });
    }
}

// Make documentation functions globally available
window.downloadPostmanCollection = downloadPostmanCollection;
window.showSystemInfo = showSystemInfo;
window.copySystemInfo = copySystemInfo;
window.initDocsSection = initDocsSection;