'use client';

import { PageShell } from '../../components/layout/PageShell';
import { CoachContent } from '../../components/sections/CoachContent';
import { useRecovery } from '../providers/RecoveryContext';

export default function CoachPage() {
  const { chat, chatInput, setChatInput, sendChat } = useRecovery();

  return (
    <PageShell>
      <CoachContent
        chat={chat}
        chatInput={chatInput}
        setChatInput={setChatInput}
        sendChat={sendChat}
      />
    </PageShell>
  );
}
