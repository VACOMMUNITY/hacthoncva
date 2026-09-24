import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { HackathonRegistration } from '@/services/hackathonService';

interface TicketCanvasProps {
  registration: HackathonRegistration;
  triggerConfettiOnMount?: boolean;
}

export const TicketCanvas: React.FC<TicketCanvasProps> = ({
  registration,
  triggerConfettiOnMount = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [qrLoaded, setQrLoaded] = useState(false);

  useEffect(() => {
    if (triggerConfettiOnMount) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00f0ff', '#3b82f6', '#9333ea', '#ffffff'],
        });
      } catch (e) {
        console.warn('Confetti error:', e);
      }
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // High resolution canvas for crisp text and QR code
      const scale = 2;
      const width = 760;
      const height = 360;
      canvas.width = width * scale;
      canvas.height = height * scale;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(scale, scale);

      // 1. Background
      ctx.fillStyle = '#060a17';
      ctx.fillRect(0, 0, width, height);

      // Neon outer border
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#0066ff';
      ctx.strokeRect(6, 6, width - 12, height - 12);

      // Subtle inner gradient
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
      grad.addColorStop(0.5, 'rgba(0, 102, 255, 0.04)');
      grad.addColorStop(1, 'rgba(10, 15, 30, 0.2)');
      ctx.fillStyle = grad;
      ctx.fillRect(8, 8, width - 16, height - 16);

      // 2. Tear-off perforated line
      const perfX = 530;
      ctx.save();
      ctx.setLineDash([8, 8]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(perfX, 10);
      ctx.lineTo(perfX, height - 10);
      ctx.stroke();

      // Notches at the perforation line
      ctx.restore();
      ctx.fillStyle = '#030712';
      ctx.beginPath();
      ctx.arc(perfX, 6, 12, 0, Math.PI);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(perfX, height - 6, 12, Math.PI, 0);
      ctx.fill();

      // 3. Left Header
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('COMMUNITY.VA • OFFICIAL EVENT PASS', 35, 45);

      // Hackathon Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px sans-serif';
      ctx.fillText('AI INNOVATION HACKATHON 2026', 35, 82);

      // Tagline
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 13px sans-serif';
      ctx.fillText('Build AI-Powered Solutions for Real-World Problems', 35, 105);

      // Info Grid
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('EVENT DATE', 35, 145);
      ctx.fillText('FORMAT', 200, 145);
      ctx.fillText('CHALLENGE TRACK', 330, 145);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 14px sans-serif';
      ctx.fillText('9 October 2026', 35, 168);
      ctx.fillText('Online (24 Hours)', 200, 168);
      ctx.fillText(registration?.track || 'Open Innovation', 330, 168);

      // Team Details
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('TEAM NAME', 35, 210);
      ctx.fillText('TEAM LEADER', 200, 210);
      ctx.fillText('COLLEGE', 330, 210);

      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 16px sans-serif';
      const teamName = registration?.team_name || 'Innovators';
      ctx.fillText(teamName.length > 20 ? `${teamName.slice(0, 18)}...` : teamName, 35, 233);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 14px sans-serif';
      const leaderName = registration?.leader_name || 'Leader';
      ctx.fillText(leaderName.length > 18 ? `${leaderName.slice(0, 16)}...` : leaderName, 200, 233);

      const collegeStr = registration?.college || 'University';
      const collegeText =
        collegeStr.length > 22
          ? `${collegeStr.slice(0, 20)}...`
          : collegeStr;
      ctx.fillText(collegeText, 330, 233);

      // Badges / Footer Info
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      ctx.fillRect(35, 270, 150, 32);
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 1;
      ctx.strokeRect(35, 270, 150, 32);

      const phase = (registration?.registration_phase || 'Early Bird').toUpperCase();
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`PASS: ${phase}`, 48, 291);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('● STATUS: VERIFIED & CONFIRMED', 210, 291);

      // Static right stub fallback
      const teamId = registration?.team_id || 'CVA-HACK-2026';
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('ADMIT TEAM', perfX + 45, 195);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(teamId, perfX + 25, 225);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '500 11px sans-serif';
      ctx.fillText('OFFICIAL CHECK-IN PASS', perfX + 25, 255);

      // 4. Right Stub QR Code
      const qrData = JSON.stringify({
        team_id: teamId,
        name: teamName,
        leader: leaderName,
        verified: true,
        pass: phase,
        event: 'CVA-AI-HACK-2026',
      });

      QRCode.toDataURL(qrData, {
        margin: 1,
        width: 140,
        color: {
          dark: '#00f0ff',
          light: '#060a17',
        },
      })
        .then((qrUrl) => {
          const img = new Image();
          img.onload = () => {
            try {
              ctx.drawImage(img, perfX + 35, 35, 125, 125);
              setQrLoaded(true);
            } catch (err) {
              console.warn('QR draw error:', err);
            }
          };
          img.src = qrUrl;
        })
        .catch((err) => {
          console.warn('QR generation error:', err);
          // Fallback drawn QR block
          ctx.fillStyle = '#00f0ff';
          ctx.fillRect(perfX + 45, 45, 100, 100);
          ctx.fillStyle = '#060a17';
          ctx.font = 'bold 12px monospace';
          ctx.fillText('CVA-QR', perfX + 70, 100);
        });
    } catch (renderError) {
      console.error('Error drawing TicketCanvas:', renderError);
    }
  }, [registration, triggerConfettiOnMount]);

  const handleDownloadTicket = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const link = document.createElement('a');
      link.download = `CommunityVA_Hackathon_Ticket_${registration?.team_id || 'Pass'}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Download ticket error:', e);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 my-4 w-full">
      <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold tracking-wide uppercase">
        <Sparkles className="h-4 w-4" />
        Verified Hackathon Access Pass
      </div>

      {/* Responsive Canvas Container with horizontal scroll on small screens */}
      <div className="max-w-full overflow-x-auto p-2 rounded-2xl cyber-card-glass shadow-neon-md">
        <canvas
          ref={canvasRef}
          className="rounded-xl shadow-2xl block mx-auto border border-cyan-500/30"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Button
          onClick={handleDownloadTicket}
          size="lg"
          className="cyber-button-glow text-slate-950 font-bold px-8 shadow-neon-md flex items-center gap-2"
        >
          <Download className="h-5 w-5" />
          Download Ticket (PNG)
        </Button>
      </div>

      <p className="text-xs text-slate-400 text-center max-w-md">
        Present this verified ticket with your Team ID <strong>{registration?.team_id || 'ID'}</strong> on
        the hackathon Discord and opening check-in.
      </p>
    </div>
  );
};
export default TicketCanvas;
