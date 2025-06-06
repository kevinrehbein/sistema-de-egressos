document.addEventListener('DOMContentLoaded', () => {
    const egressosGrid = document.getElementById('egressos-grid');
    const filterCurso = document.getElementById('filter-curso');
    const filterAno = document.getElementById('filter-ano');
    const btnFiltrar = document.getElementById('btn-filtrar');
    const loadingMessage = document.getElementById('loading');
    const emptyMessage = document.getElementById('empty');

    // Cores para os fundos das imagens dos cards, para variar
    const cardBackgroundColors = ['bg-color-1', 'bg-color-2', 'bg-color-3', 'bg-color-4', 'bg-color-5'];
    let colorIndex = 0;

    // API_BASE_URL deve ser a URL do seu backend (Node.js/Express, Python/Flask, etc.)
    // Exemplo: const API_BASE_URL = 'http://localhost:3000/api';
    // Para este exemplo, vamos usar dados mockados se a API não estiver disponível
    const API_BASE_URL = 'http://localhost:3000/api'; // AJUSTE PARA SUA API REAL

    async function fetchFromAPI(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`);
            if (!response.ok) {
                console.error(`Erro na API ${endpoint}: ${response.status}`);
                return null; // Retorna null para que possamos usar dados mockados
            }
            return await response.json();
        } catch (error) {
            console.error(`Falha ao buscar ${endpoint}:`, error);
            return null; // Retorna null em caso de falha total (ex: API offline)
        }
    }

    // Função para carregar os cursos no filtro
    async function carregarCursos() {
        let cursos = await fetchFromAPI('cursos');
        if (!cursos) { // Se a API falhar ou retornar null, usa dados mockados
            console.warn("API de cursos falhou, usando dados mockados para cursos.");
            cursos = [
                { id_curso: 1, nome_curso: "Ciência da Computação" },
                { id_curso: 2, nome_curso: "Engenharia da Computação" },
                { id_curso: 3, nome_curso: "Mestrado em Ciência da Computação" },
                { id_curso: 4, nome_curso: "Doutorado em Ciência da Computação" }
            ];
        }
        
        if (cursos) {
            cursos.forEach(curso => {
                const option = document.createElement('option');
                option.value = curso.id_curso;
                option.textContent = curso.nome_curso;
                filterCurso.appendChild(option);
            });
        } else {
            filterCurso.innerHTML = '<option value="">Não foi possível carregar os cursos</option>';
        }
    }

    // Função para buscar e exibir os egressos com base nos filtros
    async function buscarEgressos() {
        loadingMessage.style.display = 'block';
        emptyMessage.style.display = 'none';
        egressosGrid.innerHTML = ''; // Limpa o grid antes de adicionar novos cards
        // Adiciona a mensagem de loading de volta ao grid enquanto busca
        egressosGrid.appendChild(loadingMessage);


        const cursoId = filterCurso.value;
        const anoConclusao = filterAno.value;

        let queryString = 'egressos?';
        if (cursoId) {
            queryString += `id_curso=${cursoId}&`;
        }
        if (anoConclusao) {
            queryString += `ano_conclusao=${anoConclusao}&`;
        }
        
        let egressos = await fetchFromAPI(queryString.slice(0, -1)); // Remove o último '&' ou '?'

        if (!egressos) { // Se a API falhar ou retornar null, usa dados mockados
            console.warn("API de egressos falhou, usando dados mockados para egressos.");
            // Simula um pequeno atraso para a mensagem de "carregando"
            await new Promise(resolve => setTimeout(resolve, 700));
            egressos = [
                // Dados mockados se a API falhar
                { nome_completo: "Ana Silva", foto_perfil_url: "https://via.placeholder.com/200/E0F7FA/333?text=Ana", link_lattes: "#", link_github: "#", link_linkedin: "#", periodo_formacao: "2016 - 2020", nome_curso: "Ciência da Computação" },
                { nome_completo: "Bruno Costa", foto_perfil_url: "https://via.placeholder.com/200/FFF3E0/333?text=Bruno", link_lattes: "#", link_linkedin: "#", periodo_formacao: "2015 - 2019", nome_curso: "Engenharia da Computação"},
                { nome_completo: "Carla Dias", foto_perfil_url: "https://via.placeholder.com/200/E8EAF6/333?text=Carla", link_github: "#", link_linkedin: "#", periodo_formacao: "2017 - 2021", nome_curso: "Ciência da Computação" },
                { nome_completo: "Daniel Alves", foto_perfil_url: "https://via.placeholder.com/200/E0F2F1/333?text=Daniel", link_lattes: "#", link_instagram: "#", periodo_formacao: "2018 - 2022", nome_curso: "Mestrado em C. da Computação" }
            ];
             // Aplicar filtros mockados também se necessário (simplificado aqui)
            if (cursoId) {
                egressos = egressos.filter(e => e.nome_curso.toLowerCase().includes(filterCurso.options[filterCurso.selectedIndex].text.toLowerCase().substring(0,5))); // Filtro mockado simples
            }
            if (anoConclusao) {
                 egressos = egressos.filter(e => e.periodo_formacao.endsWith(anoConclusao));
            }
        }
        
        // Remove a mensagem de "carregando" antes de renderizar
        const currentLoadingMsg = egressosGrid.querySelector('.loading-message');
        if (currentLoadingMsg) {
            currentLoadingMsg.remove();
        }

        if (egressos) {
            renderEgressos(egressos);
        } else {
             egressosGrid.innerHTML = ''; // Limpa caso tenha algo
             loadingMessage.textContent = 'Erro ao carregar os egressos. Tente novamente mais tarde.';
             loadingMessage.style.display = 'block';
        }
    }

    // Função para renderizar os cards dos egressos no grid
    function renderEgressos(egressos) {
        egressosGrid.innerHTML = ''; // Limpa o grid (caso a mensagem de loading não tenha sido removida)

        if (egressos.length === 0) {
            emptyMessage.style.display = 'block';
            egressosGrid.appendChild(emptyMessage); // Adiciona a mensagem de vazio ao grid
            return;
        }
        emptyMessage.style.display = 'none';


        egressos.forEach(egresso => {
            const card = document.createElement('div');
            card.className = 'egresso-card';

            // Rotaciona as cores de fundo para a imagem
            const currentBgColorClass = cardBackgroundColors[colorIndex % cardBackgroundColors.length];
            colorIndex++;

            const fotoContainer = document.createElement('div');
            fotoContainer.className = `card-image-background ${currentBgColorClass}`;
            
            const fotoImg = document.createElement('img');
            // Usa uma URL de placeholder com a cor de fundo se a foto do egresso não estiver disponível
            const fotoUrl = egresso.foto_perfil_url || `https://via.placeholder.com/250/${currentBgColorClass.split('-')[2].toUpperCase()}/333?text=${egresso.nome_completo.split(' ')[0]}`;
            fotoImg.src = fotoUrl;
            fotoImg.alt = `Foto de ${egresso.nome_completo}`;
            fotoContainer.appendChild(fotoImg);

            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            const nome = document.createElement('h3');
            nome.textContent = egresso.nome_completo;

            const role = document.createElement('p');
            role.className = 'role';
            role.textContent = egresso.nome_curso || "Egresso"; // Curso ou título genérico

            const description = document.createElement('p');
            description.className = 'description';
            description.textContent = egresso.periodo_formacao || "Período não informado"; // Período de formação

            const socialLinks = document.createElement('div');
            socialLinks.className = 'social-links';
            
            if (egresso.link_lattes) {
                socialLinks.innerHTML += `<a href="${egresso.link_lattes}" target="_blank" title="Lattes"><i class="fas fa-graduation-cap"></i></a>`;
            }
            if (egresso.link_github) {
                socialLinks.innerHTML += `<a href="${egresso.link_github}" target="_blank" title="GitHub"><i class="fab fa-github"></i></a>`;
            }
            if (egresso.link_linkedin) {
                socialLinks.innerHTML += `<a href="${egresso.link_linkedin}" target="_blank" title="LinkedIn"><i class="fab fa-linkedin"></i></a>`;
            }
            if (egresso.link_instagram) {
                socialLinks.innerHTML += `<a href="${egresso.link_instagram}" target="_blank" title="Instagram"><i class="fab fa-instagram"></i></a>`;
            }
            // Adiciona um link genérico se nenhum outro estiver presente (opcional)
            if (socialLinks.innerHTML === '') {
                socialLinks.innerHTML = `<a href="#" title="Contato"><i class="fas fa-envelope"></i></a>`;
            }


            cardContent.appendChild(nome);
            cardContent.appendChild(role);
            cardContent.appendChild(description);
            cardContent.appendChild(socialLinks);

            card.appendChild(fotoContainer);
            card.appendChild(cardContent);
            
            egressosGrid.appendChild(card);
        });
    }

    // Event Listeners
    btnFiltrar.addEventListener('click', buscarEgressos);
    filterAno.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            buscarEgressos();
        }
    });
    filterCurso.addEventListener('change', buscarEgressos); // Filtra ao mudar o curso também

    // Carregar dados iniciais
    carregarCursos().then(() => {
        buscarEgressos(); // Carrega todos os egressos após carregar os cursos
    });
});