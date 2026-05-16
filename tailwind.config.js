module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}'],
  theme: { extend: {
    colors: { sage: { bg:'#1C1C1A',bg2:'#232320',bg3:'#2A2A27',bg4:'#333330',border:'#3A3A36',border2:'#4A4A44',t1:'#F5F0E8',t2:'#BEB8A8',t3:'#8A8478',t4:'#5C5850',t5:'#3E3C38',ac:'#8B9A6B','ac-light':'#A3B27E','ac-dark':'#6B7A50',sand:'#C4A56A' }},
    fontFamily: { display:['var(--font-display)'], body:['var(--font-body)'], mono:['var(--font-mono)'] },
  }},
  plugins: [],
}
