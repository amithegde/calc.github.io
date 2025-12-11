export function mount(container: HTMLElement) {
  const card = document.createElement('div')
  card.className = 'glass-panel p-6 max-w-2xl mx-auto text-center space-y-3'
  card.innerHTML = `
    <p class="text-sm text-gray-500">Currency conversion</p>
    <h2 class="text-2xl font-semibold text-gray-900">Coming soon</h2>
    <p class="text-gray-600">A currency converter will live here. In the meantime, try the other calculators using the navigation menu.</p>
    <div class="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm text-brand-700 font-semibold">Placeholder module</div>
  `
  container.appendChild(card)
}

