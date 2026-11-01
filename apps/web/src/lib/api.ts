const API_BASE = '/api';

export interface AuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    role: 'merchant' | 'ops_agent' | 'ops_manager' | 'admin' | 'system_agent';
    email?: string;
    phone?: string;
    merchantId?: string;
    businessName?: string;
    language?: string;
    bankLast4?: string;
  };
}

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    const session = this.getSession();
    if (session?.token) {
      return { Authorization: `Bearer ${session.token}` };
    }
    return {};
  }

  public getSession(): AuthSession | null {
    const raw = localStorage.getItem('sulajh_auth_session');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public setSession(session: AuthSession): void {
    localStorage.setItem('sulajh_auth_session', JSON.stringify(session));
  }

  public clearSession(): void {
    localStorage.removeItem('sulajh_auth_session');
  }

  /** Returns an existing merchant session, or signs in demo merchant if none exists */
  public async ensureMerchantSession(): Promise<AuthSession | null> {
    const existing = this.getSession();
    if (existing?.token && existing.user.role === 'merchant') return existing;
    try {
      const res = await this.login('piyushyenorkar1@gmail.com', '123456');
      if (res.ok && res.token) {
        return this.getSession();
      }
      const fallback = await this.login('ramesh@kirana.in', 'password123');
      if (fallback.ok && fallback.token) {
        return this.getSession();
      }
    } catch {
      // offline fallback
    }
    return null;
  }

  /** Returns an existing staff session, or signs in demo L1 agent if none exists */
  public async ensureOpsSession(): Promise<AuthSession | null> {
    const existing = this.getSession();
    if (existing?.token && (existing.user.role === 'ops_agent' || existing.user.role === 'ops_manager' || existing.user.role === 'admin')) {
      return existing;
    }
    try {
      const res = await this.staffLogin('vikram.ops@paytm.com', 'password123');
      if (res.ok && res.token) {
        return this.getSession();
      }
    } catch {
      // offline fallback
    }
    return null;
  }

  // ─── AUTH ──────────────────────────────────────────────────────────────────
  public async requestOtp(identifier: string) {
    const isEmail = identifier.includes('@');
    const res = await fetch(`${API_BASE}/auth/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier,
        phone: !isEmail ? identifier : undefined,
        email: isEmail ? identifier : undefined,
      }),
    });
    return res.json();
  }

  public async verifyOtp(identifier: string, otp: string) {
    const isEmail = identifier.includes('@');
    const res = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier,
        phone: !isEmail ? identifier : undefined,
        email: isEmail ? identifier : undefined,
        otp,
      }),
    });
    const data = await res.json();
    if (data.ok && data.token) {
      this.setSession(data);
    }
    return data;
  }

  public async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.ok && !data.requires2FA && data.token) {
      this.setSession(data);
    }
    return { ok: res.ok, ...data };
  }

  public async signup(payload: {
    name: string;
    businessName: string;
    email: string;
    password: string;
    phone: string;
    category?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok && data.token) {
      this.setSession(data);
    }
    return { ok: res.ok, ...data };
  }

  public async staffLogin(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/staff/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.ok && !data.requires2FA && data.token) {
      this.setSession(data);
    }
    return data;
  }

  public async verifyStaff2FA(userId: string, code: string) {
    const res = await fetch(`${API_BASE}/auth/staff/2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, code }),
    });
    const data = await res.json();
    if (data.ok && data.token) {
      this.setSession(data);
    }
    return data;
  }

  // ─── CHAT & VOICE ──────────────────────────────────────────────────────────
  public async sendChatMessage(text: string, caseId?: string, lang?: string) {
    let session = this.getSession();
    if (!session?.token) {
      session = await this.ensureMerchantSession();
    }
    if (!session?.token) {
      return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Please sign in to continue.' } };
    }

    let res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ text, case_id: caseId, lang }),
    });

    if (res.status === 401) {
      this.clearSession();
      const reSession = await this.ensureMerchantSession();
      if (reSession?.token) {
        res = await fetch(`${API_BASE}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeader(),
          },
          body: JSON.stringify({ text, case_id: caseId, lang }),
        });
      }
    }

    const data = await res.json();
    return { ok: res.ok, ...data };
  }

  public async transcribeVoice(samplePhrase?: string) {
    const res = await fetch(`${API_BASE}/voice/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ sample_phrase: samplePhrase }),
    });
    return res.json();
  }

  // ─── SETTLEMENTS ───────────────────────────────────────────────────────────
  public async getSettlements(merchantId?: string) {
    const url = merchantId ? `${API_BASE}/merchant/settlements?merchant_id=${merchantId}` : `${API_BASE}/merchant/settlements`;
    const res = await fetch(url, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  public async getSettlementDetail(settlementId: string) {
    const res = await fetch(`${API_BASE}/merchant/settlements/${settlementId}`, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  // ─── CASES & DECISIONS ─────────────────────────────────────────────────────
  public async getCases(status?: string, merchantId?: string) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (merchantId) params.append('merchant_id', merchantId);

    const res = await fetch(`${API_BASE}/cases?${params.toString()}`, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  public async getCaseDetail(caseId: string) {
    const res = await fetch(`${API_BASE}/cases/${caseId}`, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  public async submitCaseDecision(caseId: string, decision: 'approved' | 'rejected', reason: string) {
    const res = await fetch(`${API_BASE}/cases/${caseId}/decision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ decision, reason }),
    });
    return res.json();
  }

  // ─── INCIDENTS ─────────────────────────────────────────────────────────────
  public async getIncidents() {
    const res = await fetch(`${API_BASE}/incidents`, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  public async getIncidentDetail(id: string) {
    const res = await fetch(`${API_BASE}/incidents/${id}`, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  public async bulkRetryIncident(id: string) {
    const res = await fetch(`${API_BASE}/incidents/${id}/bulk-retry`, {
      method: 'POST',
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  // ─── METRICS ───────────────────────────────────────────────────────────────
  public async getMetrics() {
    const res = await fetch(`${API_BASE}/metrics`, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  // ─── POLICIES & SUGGESTIONS ────────────────────────────────────────────────
  public async getPolicies() {
    const res = await fetch(`${API_BASE}/policies`, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  public async updatePolicy(key: string, value: string) {
    const res = await fetch(`${API_BASE}/policies`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ key, value }),
    });
    return res.json();
  }

  public async getPolicySuggestions() {
    const res = await fetch(`${API_BASE}/policies/suggestions`, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  public async actOnSuggestion(id: string, action: 'accept' | 'dismiss') {
    const res = await fetch(`${API_BASE}/policies/suggestions/${id}/action`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ action }),
    });
    return res.json();
  }

  // ─── AUDIT ─────────────────────────────────────────────────────────────────
  public async getAuditLogs(caseId?: string) {
    const url = caseId ? `${API_BASE}/audit?case_id=${caseId}` : `${API_BASE}/audit`;
    const res = await fetch(url, {
      headers: this.getAuthHeader(),
    });
    return res.json();
  }

  // ─── DEMO EVENTS ───────────────────────────────────────────────────────────
  public async triggerMockEvent(type: string, merchantId?: string) {
    const res = await fetch(`${API_BASE}/mock/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
      },
      body: JSON.stringify({ type, merchant_id: merchantId }),
    });
    return res.json();
  }
}

export const api = new ApiClient();

