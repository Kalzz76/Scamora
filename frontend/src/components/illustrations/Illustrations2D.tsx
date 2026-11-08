import React from 'react';

// ============================================================================
// 1. CEK URL: 2D DETECTIVE / SAFE URL SCANNER ILLUSTRATION
// ============================================================================
export const UrlDetectiveIllustration: React.FC<{ className?: string }> = ({ className = 'w-64 h-48' }) => {
  return (
    <svg 
      viewBox="0 0 360 260" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Soft Aura */}
      <circle cx="180" cy="130" r="110" fill="#EAF2ED" fillOpacity="0.8" />
      <circle cx="270" cy="70" r="28" fill="#FDF0EA" />
      
      {/* Floating Network Nodes */}
      <circle cx="70" cy="70" r="6" fill="#143826" fillOpacity="0.3" />
      <circle cx="295" cy="165" r="5" fill="#E86A33" fillOpacity="0.4" />
      <path d="M 75 75 L 120 100" stroke="#143826" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.3" />
      <path d="M 245 150 L 290 165" stroke="#E86A33" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.4" />

      {/* Main Browser Window Frame */}
      <g filter="drop-shadow(0px 10px 20px rgba(20, 56, 38, 0.12))">
        <rect x="90" y="55" width="180" height="135" rx="18" fill="#FFFFFF" stroke="#E8ECE9" strokeWidth="2" />
        
        {/* Browser Top Bar */}
        <rect x="90" y="55" width="180" height="26" rx="18" fill="#F8F9FA" />
        <circle cx="106" cy="68" r="3.5" fill="#FF5F56" />
        <circle cx="118" cy="68" r="3.5" fill="#FFBD2E" />
        <circle cx="130" cy="68" r="3.5" fill="#27C93F" />
        
        {/* Address URL Pill inside Window */}
        <rect x="145" y="62" width="115" height="12" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
        <circle cx="152" cy="68" r="2.5" fill="#143826" />
        <rect x="158" y="66" width="55" height="4" rx="2" fill="#94A3B8" />

        {/* Browser Content Area: Safe Web Elements */}
        <rect x="108" y="94" width="70" height="8" rx="4" fill="#143826" />
        <rect x="108" y="108" width="95" height="5" rx="2.5" fill="#CBD5E1" />
        <rect x="108" y="117" width="80" height="5" rx="2.5" fill="#E2E8F0" />

        {/* Small Data Blocks */}
        <rect x="108" y="135" width="36" height="32" rx="8" fill="#EAF2ED" />
        <rect x="150" y="135" width="36" height="32" rx="8" fill="#FDF0EA" />
      </g>

      {/* Shield of Trust on the right */}
      <g filter="drop-shadow(0px 8px 16px rgba(20, 56, 38, 0.16))">
        <path 
          d="M 235 95 C 235 95 255 90 270 85 C 270 120 258 148 235 160 C 212 148 200 120 200 85 C 215 90 235 95 235 95 Z" 
          fill="#143826" 
        />
        <path 
          d="M 235 101 C 235 101 251 97 263 93 C 263 121 253 143 235 153 C 217 143 207 121 207 93 C 219 97 235 101 235 101 Z" 
          fill="#255D40" 
        />
        {/* Checkmark inside Shield */}
        <path 
          d="M 223 122 L 231 130 L 247 114" 
          stroke="#FFFFFF" 
          strokeWidth="3.5" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
      </g>

      {/* 2D Cyber Magnifying Glass Inspector (Hovering) */}
      <g filter="drop-shadow(0px 12px 24px rgba(232, 106, 51, 0.25))">
        {/* Glass Ring */}
        <circle cx="115" cy="165" r="34" fill="#FFFFFF" fillOpacity="0.85" stroke="#E86A33" strokeWidth="5" />
        <circle cx="115" cy="165" r="26" fill="#EAF2ED" fillOpacity="0.5" stroke="#E86A33" strokeWidth="1" strokeDasharray="3 3" />
        
        {/* Lock inside Lens */}
        <rect x="107" y="161" width="16" height="13" rx="3" fill="#E86A33" />
        <path d="M 111 161 V 156 C 111 153.5 113 151.5 115 151.5 C 117 151.5 119 153.5 119 156 V 161" stroke="#E86A33" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="115" cy="167" r="1.5" fill="#FFFFFF" />

        {/* Handle */}
        <line x1="139" y1="189" x2="168" y2="218" stroke="#143826" strokeWidth="8" strokeLinecap="round" />
        <line x1="140" y1="190" x2="148" y2="198" stroke="#E86A33" strokeWidth="6" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// ============================================================================
// 2. ANALISIS CHAT: 2D WHATSAPP CHAT FORENSICS & SHIELD ILLUSTRATION
// ============================================================================
export const ChatForensicsIllustration: React.FC<{ className?: string }> = ({ className = 'w-64 h-48' }) => {
  return (
    <svg 
      viewBox="0 0 360 260" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Soft Aura */}
      <circle cx="180" cy="130" r="110" fill="#EAF2ED" fillOpacity="0.8" />
      <circle cx="95" cy="65" r="24" fill="#FDF0EA" />

      {/* Decorative Speech dots */}
      <circle cx="280" cy="65" r="5" fill="#25D366" fillOpacity="0.4" />
      <circle cx="65" cy="175" r="6" fill="#E86A33" fillOpacity="0.3" />

      {/* 2D Smartphone Vector Body */}
      <g filter="drop-shadow(0px 14px 28px rgba(20, 56, 38, 0.15))">
        {/* Phone Case */}
        <rect x="110" y="35" width="140" height="195" rx="24" fill="#143826" />
        {/* Screen */}
        <rect x="116" y="45" width="128" height="175" rx="18" fill="#F8F9FA" />
        {/* Speaker Notch */}
        <rect x="160" y="40" width="40" height="3.5" rx="1.75" fill="#255D40" />

        {/* WhatsApp-Style App Top Bar */}
        <rect x="116" y="45" width="128" height="28" rx="18" fill="#143826" />
        <circle cx="132" cy="59" r="6" fill="#EAF2ED" />
        <rect x="144" y="55" width="55" height="4" rx="2" fill="#FFFFFF" />
        <rect x="144" y="61" width="35" height="3" rx="1.5" fill="#A7F3D0" />

        {/* Incoming Suspicious Chat Bubble (Gray Left Bubble) */}
        <g filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.06))">
          <path d="M 124 85 C 124 80 128 78 134 78 H 195 C 200 78 204 82 204 88 V 110 C 204 115 200 118 194 118 H 132 L 124 124 V 85 Z" fill="#FFFFFF" />
          <rect x="132" y="86" width="58" height="4" rx="2" fill="#E86A33" />
          <rect x="132" y="94" width="64" height="3" rx="1.5" fill="#94A3B8" />
          <rect x="132" y="100" width="48" height="3" rx="1.5" fill="#CBD5E1" />
          
          {/* Mock .APK Trojan Packet Badge inside Chat */}
          <rect x="132" y="106" width="60" height="8" rx="3" fill="#FEE2E2" />
          <circle cx="136" cy="110" r="2" fill="#DC2626" />
          <rect x="141" y="108.5" width="42" height="3" rx="1.5" fill="#DC2626" />
        </g>

        {/* Safe Outgoing Reply Bubble (Green Right Bubble) */}
        <g filter="drop-shadow(0px 3px 6px rgba(0,0,0,0.06))">
          <path d="M 152 135 C 152 130 156 128 162 128 H 230 C 235 128 238 132 238 137 V 158 C 238 163 234 167 228 167 H 160 L 152 173 V 135 Z" fill="#D9FDD3" />
          <rect x="160" y="136" width="68" height="4" rx="2" fill="#143826" />
          <rect x="160" y="144" width="55" height="3" rx="1.5" fill="#4B6358" />
          <rect x="160" y="150" width="45" height="3" rx="1.5" fill="#6B8579" />
          {/* Double Checkmark */}
          <path d="M 222 160 L 225 163 L 230 157" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 226 160 L 229 163 L 234 157" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>

      {/* Floating 2D Security Guardian Shield (Foreground Left) */}
      <g filter="drop-shadow(0px 10px 20px rgba(232, 106, 51, 0.25))">
        <circle cx="75" cy="120" r="32" fill="#FFFFFF" stroke="#E86A33" strokeWidth="3" />
        <circle cx="75" cy="120" r="24" fill="#E86A33" />
        {/* PII Masking Symbol: Eye with line */}
        <path d="M 67 120 C 67 116 71 113 75 113 C 79 113 83 116 83 120 C 83 124 79 127 75 127 C 71 127 67 124 67 120 Z" fill="#FFFFFF" />
        <circle cx="75" cy="120" r="2.5" fill="#E86A33" />
        <line x1="66" y1="112" x2="84" y2="128" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  );
};

// ============================================================================
// 3. LAPORAN: 2D AUDIT DOSSIER & CERTIFICATE ILLUSTRATION
// ============================================================================
export const AuditDossierIllustration: React.FC<{ className?: string }> = ({ className = 'w-64 h-48' }) => {
  return (
    <svg 
      viewBox="0 0 360 260" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="180" cy="130" r="110" fill="#EAF2ED" fillOpacity="0.8" />
      
      {/* Back Document Layer */}
      <rect x="85" y="45" width="170" height="180" rx="16" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" transform="rotate(-4 170 135)" opacity="0.6" />

      {/* Main Forensic Dossier Card */}
      <g filter="drop-shadow(0px 12px 24px rgba(20, 56, 38, 0.14))">
        <rect x="95" y="40" width="170" height="185" rx="16" fill="#FFFFFF" stroke="#E8ECE9" strokeWidth="2" />
        
        {/* Header Ribbon */}
        <rect x="95" y="40" width="170" height="28" rx="16" fill="#143826" />
        <circle cx="112" cy="54" r="5" fill="#E86A33" />
        <rect x="124" y="51" width="70" height="6" rx="3" fill="#FFFFFF" />

        {/* Telemetry Risk Meter Gauge Arc */}
        <circle cx="180" cy="105" r="28" stroke="#EAF2ED" strokeWidth="7" fill="none" />
        <path d="M 152 105 A 28 28 0 0 1 198 84" stroke="#E86A33" strokeWidth="7" strokeLinecap="round" fill="none" />
        <text x="180" y="110" textAnchor="middle" fill="#143826" fontSize="13" fontWeight="900" fontFamily="sans-serif">94%</text>
        <text x="180" y="122" textAnchor="middle" fill="#64748B" fontSize="8" fontWeight="700" fontFamily="sans-serif">RISIKO TINGGI</text>

        {/* 4 Pillars Mini Checklist Rows */}
        <g transform="translate(112, 136)">
          <rect x="0" y="0" width="136" height="12" rx="4" fill="#F8F9FA" />
          <circle cx="6" cy="6" r="3" fill="#DC2626" />
          <rect x="14" y="4" width="75" height="4" rx="2" fill="#475569" />

          <rect x="0" y="16" width="136" height="12" rx="4" fill="#F8F9FA" />
          <circle cx="6" cy="22" r="3" fill="#E86A33" />
          <rect x="14" y="20" width="60" height="4" rx="2" fill="#475569" />

          <rect x="0" y="32" width="136" height="12" rx="4" fill="#F8F9FA" />
          <circle cx="6" cy="38" r="3" fill="#16A34A" />
          <rect x="14" y="36" width="90" height="4" rx="2" fill="#475569" />
        </g>

        {/* Official Security Stamp (Bottom Right Seal) */}
        <g transform="translate(210, 175) rotate(-12)">
          <circle cx="22" cy="22" r="22" fill="#FDF0EA" stroke="#E86A33" strokeWidth="2" strokeDasharray="3 2" />
          <circle cx="22" cy="22" r="17" fill="none" stroke="#E86A33" strokeWidth="1" />
          <text x="22" y="21" textAnchor="middle" fill="#E86A33" fontSize="6.5" fontWeight="900" fontFamily="monospace">SCAMORA</text>
          <text x="22" y="28" textAnchor="middle" fill="#E86A33" fontSize="5.5" fontWeight="800" fontFamily="monospace">VERIFIED</text>
        </g>
      </g>
    </svg>
  );
};

// ============================================================================
// 4. PANDUAN: 2D INTERACTIVE GUIDEBOOK & STEP ROADMAP ILLUSTRATION
// ============================================================================
export const GuidebookIllustration: React.FC<{ className?: string }> = ({ className = 'w-64 h-48' }) => {
  return (
    <svg 
      viewBox="0 0 360 260" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="180" cy="130" r="110" fill="#EAF2ED" fillOpacity="0.8" />
      
      {/* 2D Open Book / Roadmap Vector */}
      <g filter="drop-shadow(0px 12px 24px rgba(20, 56, 38, 0.14))">
        {/* Book Left Page */}
        <path d="M 180 80 C 145 72 105 76 80 84 V 192 C 105 184 145 180 180 188 Z" fill="#FFFFFF" stroke="#E8ECE9" strokeWidth="2" />
        {/* Book Right Page */}
        <path d="M 180 80 C 215 72 255 76 280 84 V 192 C 255 184 215 180 180 188 Z" fill="#FFFFFF" stroke="#E8ECE9" strokeWidth="2" />
        {/* Center Spine */}
        <line x1="180" y1="78" x2="180" y2="189" stroke="#CBD5E1" strokeWidth="2" />

        {/* Left Page Content: Checklist Step */}
        <rect x="96" y="98" width="55" height="6" rx="3" fill="#143826" />
        <circle cx="102" cy="116" r="4" fill="#EAF2ED" stroke="#143826" strokeWidth="1.5" />
        <rect x="112" y="114" width="48" height="4" rx="2" fill="#94A3B8" />

        <circle cx="102" cy="132" r="4" fill="#EAF2ED" stroke="#143826" strokeWidth="1.5" />
        <rect x="112" y="130" width="42" height="4" rx="2" fill="#94A3B8" />

        <circle cx="102" cy="148" r="4" fill="#E86A33" />
        <rect x="112" y="146" width="52" height="4" rx="2" fill="#475569" />

        {/* Right Page Content: Step-by-Step Diagram */}
        <rect x="196" y="98" width="60" height="6" rx="3" fill="#E86A33" />
        <rect x="196" y="112" width="70" height="45" rx="8" fill="#F8F9FA" stroke="#E2E8F0" strokeWidth="1" />
        
        {/* Shield in Diagram */}
        <path d="M 231 124 C 231 124 239 122 245 120 C 245 134 240 145 231 150 C 222 145 217 134 217 120 C 223 122 231 124 231 124 Z" fill="#143826" />
        <path d="M 227 134 L 230 137 L 236 130" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Bookmark Ribbon */}
        <path d="M 174 72 V 125 L 180 119 L 186 125 V 72 Z" fill="#E86A33" />
      </g>

      {/* 2D Cyber Compass in Foreground */}
      <g filter="drop-shadow(0px 8px 16px rgba(20, 56, 38, 0.18))" transform="translate(65, 140)">
        <circle cx="26" cy="26" r="26" fill="#143826" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="26" cy="26" r="21" fill="#255D40" />
        <circle cx="26" cy="26" r="3" fill="#FFFFFF" />
        {/* Compass Needles */}
        <polygon points="26,11 30,26 26,23 22,26" fill="#E86A33" />
        <polygon points="26,41 30,26 26,29 22,26" fill="#FFFFFF" />
      </g>
    </svg>
  );
};

// ============================================================================
// 5. TANTANGAN AI: 2D DETECTIVE CHALLENGE & TROPHY ARENA ILLUSTRATION
// ============================================================================
export const QuizArenaIllustration: React.FC<{ className?: string }> = ({ className = 'w-full h-auto max-w-[280px] mx-auto' }) => {
  return (
    <svg 
      viewBox="0 0 360 260" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="180" cy="130" r="110" fill="#EAF2ED" fillOpacity="0.8" />
      
      {/* Confetti geometric circles */}
      <circle cx="85" cy="70" r="5" fill="#E86A33" />
      <circle cx="275" cy="65" r="6" fill="#143826" fillOpacity="0.4" />
      <circle cx="295" cy="140" r="4" fill="#255D40" />

      {/* Decision Cards (Red vs Green) */}
      <g filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.08))">
        {/* Red Fraud Decision Card */}
        <rect x="75" y="85" width="85" height="110" rx="14" fill="#FFFFFF" stroke="#FECACA" strokeWidth="2" transform="rotate(-8 117 140)" />
        <rect x="85" y="100" width="60" height="20" rx="6" fill="#FEE2E2" transform="rotate(-8 117 140)" />
        <circle cx="115" cy="155" r="14" fill="#EF4444" transform="rotate(-8 117 140)" />
        <path d="M 111 151 L 119 159 M 119 151 L 111 159" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" transform="rotate(-8 117 140)" />
      </g>

      <g filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.08))">
        {/* Green Safe Decision Card */}
        <rect x="200" y="85" width="85" height="110" rx="14" fill="#FFFFFF" stroke="#BBF7D0" strokeWidth="2" transform="rotate(8 242 140)" />
        <rect x="210" y="100" width="60" height="20" rx="6" fill="#DCFCE7" transform="rotate(8 242 140)" />
        <circle cx="240" cy="155" r="14" fill="#22C55E" transform="rotate(8 242 140)" />
        <path d="M 235 155 L 238 158 L 246 150" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(8 242 140)" />
      </g>

      {/* Golden Badge of Cyber Wisdom (Center Trophy) */}
      <g filter="drop-shadow(0px 14px 28px rgba(232, 106, 51, 0.3))">
        <circle cx="180" cy="130" r="40" fill="#FFFFFF" stroke="#E8ECE9" strokeWidth="3" />
        <circle cx="180" cy="130" r="32" fill="#143826" />
        <circle cx="180" cy="130" r="26" fill="#255D40" />

        {/* Detective Cap / Target Silhouette */}
        <circle cx="180" cy="130" r="14" stroke="#E86A33" strokeWidth="3" fill="none" />
        <circle cx="180" cy="130" r="5" fill="#E86A33" />
        <line x1="180" y1="110" x2="180" y2="150" stroke="#E86A33" strokeWidth="2" strokeLinecap="round" />
        <line x1="160" y1="130" x2="200" y2="130" stroke="#E86A33" strokeWidth="2" strokeLinecap="round" />

        {/* Trophy Pedestal */}
        <path d="M 166 170 H 194 L 198 185 H 162 Z" fill="#E86A33" />
        <rect x="156" y="185" width="48" height="8" rx="3" fill="#143826" />
      </g>
    </svg>
  );
};

// ============================================================================
// 6. EDUKASI: 2D DIGITAL ACADEMY & KNOWLEDGE TREE ILLUSTRATION
// ============================================================================
export const AcademyIllustration: React.FC<{ className?: string }> = ({ className = 'w-64 h-48' }) => {
  return (
    <svg 
      viewBox="0 0 360 260" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="180" cy="130" r="110" fill="#EAF2ED" fillOpacity="0.8" />
      
      {/* 2D Modern Cyber Tree of Knowledge */}
      <g filter="drop-shadow(0px 10px 20px rgba(20, 56, 38, 0.12))">
        {/* Tree Trunk */}
        <rect x="174" y="125" width="12" height="75" rx="5" fill="#143826" />
        <line x1="174" y1="150" x2="150" y2="135" stroke="#143826" strokeWidth="4" strokeLinecap="round" />
        <line x1="186" y1="145" x2="210" y2="130" stroke="#143826" strokeWidth="4" strokeLinecap="round" />

        {/* Canopy Foliage Layers (Lush Emerald & Mint) */}
        <circle cx="180" cy="85" r="42" fill="#255D40" />
        <circle cx="150" cy="100" r="32" fill="#143826" />
        <circle cx="210" cy="100" r="32" fill="#2C774F" />
        <circle cx="180" cy="75" r="28" fill="#5BB47F" />

        {/* Knowledge Lightbulb on Tree Center */}
        <circle cx="180" cy="85" r="12" fill="#FFFFFF" />
        <circle cx="180" cy="85" r="9" fill="#E86A33" />
      </g>

      {/* Stack of Books at the Base */}
      <g filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.08))">
        {/* Book 1 (Bottom) */}
        <rect x="110" y="185" width="85" height="15" rx="3" fill="#143826" />
        <rect x="112" y="187" width="10" height="11" rx="2" fill="#E86A33" />
        <line x1="126" y1="192" x2="185" y2="192" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

        {/* Book 2 (Middle) */}
        <rect x="120" y="172" width="75" height="13" rx="3" fill="#E86A33" />
        <line x1="130" y1="178" x2="185" y2="178" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />

        {/* Book 3 (Top) */}
        <rect x="128" y="161" width="65" height="11" rx="3" fill="#255D40" />
      </g>

      {/* Open Laptop on Desk (Right) */}
      <g filter="drop-shadow(0px 8px 16px rgba(0,0,0,0.1))">
        {/* Laptop Screen */}
        <rect x="200" y="152" width="60" height="38" rx="5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="2" />
        <rect x="204" y="156" width="52" height="30" rx="3" fill="#143826" />
        <rect x="210" y="164" width="30" height="4" rx="2" fill="#5BB47F" />
        <rect x="210" y="171" width="40" height="3" rx="1.5" fill="#FFFFFF" />
        
        {/* Laptop Base */}
        <path d="M 194 190 H 266 L 262 196 H 198 Z" fill="#94A3B8" />
      </g>
    </svg>
  );
};

// ============================================================================
// 7. KOMUNITAS: 2D CITIZENS SHIELD OF COLLABORATION ILLUSTRATION
// ============================================================================
export const CommunityShieldIllustration: React.FC<{ className?: string }> = ({ className = 'w-64 h-48' }) => {
  return (
    <svg 
      viewBox="0 0 360 260" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="180" cy="130" r="110" fill="#EAF2ED" fillOpacity="0.8" />
      
      {/* Speech bubbles around community */}
      <g filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.06))">
        <rect x="65" y="65" width="65" height="26" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
        <rect x="75" y="75" width="45" height="5" rx="2.5" fill="#143826" />
        <polygon points="85,91 92,91 85,97" fill="#FFFFFF" />
      </g>

      <g filter="drop-shadow(0px 4px 8px rgba(0,0,0,0.06))">
        <rect x="235" y="75" width="70" height="28" rx="8" fill="#FFFFFF" stroke="#E2E8F0" />
        <rect x="245" y="85" width="50" height="5" rx="2.5" fill="#E86A33" />
        <polygon points="275,103 282,103 275,109" fill="#FFFFFF" />
      </g>

      {/* Main Citizens Collective Shield */}
      <g filter="drop-shadow(0px 14px 28px rgba(20, 56, 38, 0.16))">
        <path 
          d="M 180 65 C 180 65 215 58 240 50 C 240 115 220 165 180 185 C 140 165 120 115 120 50 C 145 58 180 65 180 65 Z" 
          fill="#143826" 
        />
        <path 
          d="M 180 74 C 180 74 209 68 230 61 C 230 116 213 158 180 175 C 147 158 130 116 130 61 C 151 68 180 74 180 74 Z" 
          fill="#255D40" 
        />

        {/* 2D Citizen Avatars inside/beside Shield */}
        {/* Citizen Center */}
        <circle cx="180" cy="100" r="13" fill="#FFFFFF" />
        <path d="M 160 135 C 160 120 168 116 180 116 C 192 116 200 120 200 135 Z" fill="#FFFFFF" />

        {/* Citizen Left */}
        <circle cx="152" cy="106" r="10" fill="#E86A33" />
        <path d="M 138 138 C 138 126 144 122 152 122 C 160 122 166 126 166 138 Z" fill="#E86A33" />

        {/* Citizen Right */}
        <circle cx="208" cy="106" r="10" fill="#5BB47F" />
        <path d="M 194 138 C 194 126 200 122 208 122 C 216 122 222 126 222 138 Z" fill="#5BB47F" />
      </g>

      {/* Trust Heart / Hands Motif at base */}
      <circle cx="180" cy="188" r="16" fill="#E86A33" stroke="#FFFFFF" strokeWidth="3" />
      <path d="M 174 188 L 178 192 L 187 183" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

