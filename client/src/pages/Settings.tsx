import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch, BASE_URL, getToken } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleExport() {
    const token = getToken();
    const res = await fetch(`${BASE_URL}/auth/export-data`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dodsboguiden-data-export.json';
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await apiFetch('/auth/account', { method: 'DELETE' });
      logout();
      navigate('/login');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1>Inställningar</h1>

      <div className="card">
        <h2>Exportera dina uppgifter</h2>
        <p>Ladda ner en kopia av all data vi har om dig och dina dödsbon.</p>
        <button onClick={handleExport}>Exportera data</button>
      </div>

      <div className="card">
        <h2>Radera konto</h2>
        <p>Detta raderar ditt konto permanent. Delade dödsbon påverkas inte för övriga medlemmar.</p>
        {!confirmingDelete ? (
          <button className="danger" onClick={() => setConfirmingDelete(true)}>
            Radera mitt konto
          </button>
        ) : (
          <div>
            <p className="error-text">Är du säker? Detta går inte att ångra.</p>
            <button className="danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Raderar…' : 'Ja, radera mitt konto'}
            </button>{' '}
            <button className="secondary" onClick={() => setConfirmingDelete(false)}>
              Avbryt
            </button>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Integritetspolicy</h2>
        <p>
          Dödsbo Guide samlar bara in de uppgifter som behövs för att koordinera ett enkelt dödsbo:
          namn, e-post, och de checklistor och aktiviteter du och dina familjemedlemmar skapar
          tillsammans. Vi ger ingen juridisk rådgivning. Du kan när som helst exportera eller
          radera dina uppgifter på den här sidan.
        </p>
      </div>
    </div>
  );
}
