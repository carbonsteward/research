import { stakeholders } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    const detailsContainer = document.getElementById('stakeholder-details');
    const diagramNodes = document.querySelectorAll('#stakeholder-diagram .node-item');

    if (!detailsContainer) return;


    stakeholders.forEach(category => {
        const categorySection = document.createElement('section');
        categorySection.className = `mb-16 ${category.colorClass}`;

        categorySection.innerHTML = `
            <div class="category-header">
                <div class="category-header-line"></div>
                <div class="category-header-icon">
                    <i data-lucide="${category.icon}"></i>
                </div>
                <div class="category-header-line"></div>
            </div>
            <h3 class="text-2xl md:text-3xl font-bold text-center text-slate-900 -mt-8 mb-4">${category.category}</h3>
            <p class="text-center max-w-3xl mx-auto text-slate-600 mb-12">${category.description}</p>
        `;

        category.members.forEach(member => {
            const memberId = member.id;
            const card = document.createElement('div');
            card.id = memberId;
            card.className = 'bg-white rounded-xl shadow-lg overflow-hidden mb-8 ring-1 ring-slate-900/5';

            let accordionItems = '';
            member.mechanisms.forEach((mechanism, index) => {
                accordionItems += `
                    <div class="border-t border-slate-200">
                        <div class="accordion-header">
                            <h4 class="font-semibold text-lg text-slate-800">${mechanism.name}</h4>
                            <i data-lucide="chevron-down" class="chevron text-slate-500"></i>
                        </div>
                        <div class="accordion-content">
                            <div class="prose prose-slate max-w-none text-slate-600">${mechanism.responsibilities}</div>
                        </div>
                    </div>
                `;
            });

            card.innerHTML = `
                <div class="p-6 bg-slate-50">
                    <div class="flex items-start md:items-center">
                        <div class="flex-shrink-0 mr-4">
                            <div class="w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-md">
                                <i data-lucide="${member.icon}" class="w-6 h-6 text-slate-700"></i>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-xl font-bold text-slate-900">${member.name}</h3>
                            <p class="text-sm text-slate-600 mt-1">${member.description}</p>
                        </div>
                    </div>
                </div>
                <div class="bg-white">
                    ${accordionItems}
                </div>
            `;
            categorySection.appendChild(card);
        });

        detailsContainer.appendChild(categorySection);
    });

    lucide.createIcons();


    const accordions = document.querySelectorAll('.accordion-header');
    accordions.forEach(accordion => {
        accordion.addEventListener('click', () => {
            const content = accordion.nextElementSibling;

            accordion.classList.toggle('active');

            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                content.classList.remove('open');
            } else {
                content.classList.add('open');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });


    diagramNodes.forEach(node => {
        node.addEventListener('click', () => {
            const targetId = node.dataset.target;
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });


                targetElement.style.transition = 'box-shadow 0.3s ease-in-out';
                targetElement.style.boxShadow = `0 0 0 3px var(--category-color, #38bdf8)`;
                setTimeout(() => {
                    targetElement.style.boxShadow = '';
                }, 2000);
            }
        });
    });
});
