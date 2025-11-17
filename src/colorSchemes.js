// Color schemes for heatmap

export const colorSchemes = {
  'purple': {
    name: 'Purple',
    colors: ['#e9d5ff', '#c084fc', '#a855f7', '#9333ea', '#6b21a8'],
    rgba: [
      'rgba(233, 213, 255, 0)',
      'rgba(233, 213, 255, 0.6)',
      'rgba(192, 132, 252, 0.7)',
      'rgba(168, 85, 247, 0.8)',
      'rgba(147, 51, 234, 0.85)',
      'rgba(107, 33, 168, 0.9)'
    ]
  },
  'blue-red': {
    name: 'Blue → Red',
    colors: ['#3b82f6', '#06b6d4', '#fbbf24', '#f97316', '#ef4444'],
    rgba: [
      'rgba(59, 130, 246, 0)',
      'rgba(59, 130, 246, 0.6)',
      'rgba(6, 182, 212, 0.7)',
      'rgba(251, 191, 36, 0.8)',
      'rgba(249, 115, 22, 0.85)',
      'rgba(239, 68, 68, 0.9)'
    ]
  },
  'green-red': {
    name: 'Green → Red',
    colors: ['#10b981', '#84cc16', '#facc15', '#fb923c', '#dc2626'],
    rgba: [
      'rgba(16, 185, 129, 0)',
      'rgba(16, 185, 129, 0.6)',
      'rgba(132, 204, 22, 0.7)',
      'rgba(250, 204, 21, 0.8)',
      'rgba(251, 146, 60, 0.85)',
      'rgba(220, 38, 38, 0.9)'
    ]
  },
  'cyan-orange': {
    name: 'Cyan → Orange',
    colors: ['#06b6d4', '#0ea5e9', '#f59e0b', '#f97316', '#ea580c'],
    rgba: [
      'rgba(6, 182, 212, 0)',
      'rgba(6, 182, 212, 0.6)',
      'rgba(14, 165, 233, 0.7)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(249, 115, 22, 0.85)',
      'rgba(234, 88, 12, 0.9)'
    ]
  },
  'pink-purple': {
    name: 'Pink → Purple',
    colors: ['#fda4af', '#fb7185', '#ec4899', '#d946ef', '#a855f7'],
    rgba: [
      'rgba(253, 164, 175, 0)',
      'rgba(253, 164, 175, 0.6)',
      'rgba(251, 113, 133, 0.7)',
      'rgba(236, 72, 153, 0.8)',
      'rgba(217, 70, 239, 0.85)',
      'rgba(168, 85, 247, 0.9)'
    ]
  },
  'yellow-red': {
    name: 'Yellow → Red',
    colors: ['#fef08a', '#fde047', '#fb923c', '#f87171', '#b91c1c'],
    rgba: [
      'rgba(254, 240, 138, 0)',
      'rgba(254, 240, 138, 0.6)',
      'rgba(253, 224, 71, 0.7)',
      'rgba(251, 146, 60, 0.8)',
      'rgba(248, 113, 113, 0.85)',
      'rgba(185, 28, 28, 0.9)'
    ]
  }
};

export function getColorScheme(name) {
  return colorSchemes[name] || colorSchemes['purple'];
}

