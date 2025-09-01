document.addEventListener('DOMContentLoaded', () => {
    const instancesList = document.querySelector('.instances-list');
    const webviewContainer = document.querySelector('.webview-container');
    const addInstanceBtn = document.getElementById('add-instance-btn');

    let instanceCounter = 0;

    function activateInstance(instanceId) {
        document.querySelectorAll('.webview-content').forEach(view => view.classList.remove('active'));
        document.querySelectorAll('.instance-button').forEach(btn => btn.classList.remove('active'));

        const webview = document.getElementById(instanceId);
        const button = document.querySelector(`[data-instance-id="${instanceId}"]`);

        if (webview && button) {
            webview.classList.add('active');
            button.classList.add('active');
            // Remove a notificação de brilho ao clicar
            button.classList.remove('unread');
        }
    }

    async function updateProfileInfo(webview, button) {
        console.log(`[INFO] Tentando buscar perfil para a instância: ${webview.id}`);
        try {
            const profileData = await webview.executeJavaScript(`
                (() => {
                    const profile = {};
                    // Seletor para a imagem de perfil no cabeçalho da lista de conversas
                    const profilePicButton = document.querySelector('[data-testid="chatlist-header-profile-picture"]');
                    if (profilePicButton) {
                        const imgElement = profilePicButton.querySelector('img');
                        if (imgElement) {
                            profile.imgUrl = imgElement.src;
                            profile.name = imgElement.getAttribute('title') || imgElement.getAttribute('alt');
                            console.log('[WebView] Dados do perfil encontrados:', profile);
                            return profile;
                        }
                    }
                    console.log('[WebView] Seletor de perfil não encontrado.');
                    return null;
                })();
            `);
            
            if (profileData && profileData.name) {
                console.log(`[INFO] Atualizando botão ${button.getAttribute('data-instance-id')} com:`, profileData);
                button.querySelector('.profile-name').textContent = profileData.name;
                if (profileData.imgUrl) {
                    button.querySelector('.profile-pic').src = profileData.imgUrl;
                }
            } else {
                 console.log(`[AVISO] Dados do perfil não retornados para ${webview.id}.`);
            }
        } catch (error) { 
            console.error(`[ERRO] Falha ao buscar dados para ${webview.id}:`, error); 
        }
    }

    function addInstance() {
        instanceCounter++;
        const instanceId = `wa${instanceCounter}`;

        const button = document.createElement('button');
        button.className = 'instance-button';
        button.setAttribute('data-instance-id', instanceId);
        button.innerHTML = `
            <img src="icon.png" class="profile-pic" alt="Ícone">
            <span class="profile-name">WhatsApp ${instanceCounter}</span>
        `;
        button.onclick = () => activateInstance(instanceId);
        instancesList.appendChild(button);

        const webview = document.createElement('webview');
        webview.id = instanceId;
        webview.className = 'webview-content';
        webview.src = 'https://web.whatsapp.com/';
        webview.partition = `persist:wa${instanceCounter}`;
        webview.useragent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
        webviewContainer.appendChild(webview);

        webview.addEventListener('page-title-updated', (event) => {
            const correspondingButton = document.querySelector(`[data-instance-id="${instanceId}"]`);
            // Ativa a notificação apenas se a aba não estiver ativa
            if (event.title.includes('(') && !correspondingButton.classList.contains('active')) {
                correspondingButton.classList.add('unread');
            }
        });

        webview.addEventListener('dom-ready', () => {
            // Tenta buscar as informações do perfil após carregar e depois a cada minuto
            setTimeout(() => updateProfileInfo(webview, button), 10000); 
            setInterval(() => updateProfileInfo(webview, button), 60000); 
        });

        activateInstance(instanceId);
    }
    
    addInstanceBtn.addEventListener('click', addInstance);

    addInstance(); // Inicia com a primeira instância
});
