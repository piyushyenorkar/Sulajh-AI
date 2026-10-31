export interface SettlementBreakdown {
  netPaid: number;
  commission: number;
  gstOnCommission: number;
  soundboxRental: number;
  refunds: number;
  chargebacks: number;
  grossAmount: number;
}

export interface DisputeItem {
  id: string;
  disputeId: string;
  amount: number;
  customerName: string;
  reason: string;
  dueDate: string;
  daysRemaining: number;
  priority: 'high' | 'medium' | 'low';
  evidenceUploaded: number;
  evidenceRequired: number;
  status: 'Open' | 'Under Review' | 'Defended' | 'Accepted';
}

export interface SettlementTransaction {
  id: string;
  settlementId: string;
  bankName: string;
  accountLast4: string;
  utr: string;
  amount: number;
  gross: number;
  status: 'paid' | 'delayed' | 'failed' | 'processing';
  date: string;
  failureReason?: string;
  breakdown: {
    commission: number;
    gst: number;
    soundbox: number;
    refunds: number;
    chargebacks: number;
  };
}

export interface HeatmapDay {
  date: string;
  dayOfWeek: number; // 0 = Sun, 6 = Sat
  weekIndex: number; // 0 to 11
  status: 'none' | 'paid' | 'delayed' | 'failed';
  amount?: number;
  settlementId?: string;
}

export interface ChartPoint {
  date: string;
  label: string;
  amount: number;
}

export const MERCHANT_INFO = {
  name: 'Ramesh Kumar',
  businessName: 'Ramesh Kirana Store',
  category: 'Grocery / Kirana',
  mid: 'MERCH-DELHI-4821',
  bank: 'HDFC Bank •••• 4821',
  ifsc: 'HDFC0001048',
  soundboxId: 'SBX-4G-99214',
  soundboxBattery: '88%',
};

export const KPIS = {
  totalReceivedMonth: 142850,
  monthChangePercent: 12,
  pendingPayoutsAmount: 4735.54,
  pendingCount: 3,
  deductionsThisMonth: 3415.00,
  deductionsNote: 'commission, GST, refunds',
};

export const LATEST_SETTLEMENT = {
  settlementId: 'STL-2026-HDFC-9921',
  amount: 41200.00,
  status: 'paid' as const,
  expectedDate: 'Today, Oct 31, 2026',
  cycle: 'T+1 Morning Batch',
  breakdown: {
    grossAmount: 43250.00,
    netPaid: 41200.00,
    commission: 1297.50, // 3%
    gstOnCommission: 233.50, // 18% on commission
    soundboxRental: 125.00, // Monthly rental split
    refunds: 394.00,
    chargebacks: 0,
  },
};

// Daily payout volume for segmented time controls
export const CHART_DATA_BY_TIMEFRAME: Record<string, ChartPoint[]> = {
  '1D': [
    { date: '06:00', label: '6 AM', amount: 3200 },
    { date: '09:00', label: '9 AM', amount: 14500 },
    { date: '12:00', label: '12 PM', amount: 28400 },
    { date: '15:00', label: '3 PM', amount: 35100 },
    { date: '18:00', label: '6 PM', amount: 41200 },
    { date: '21:00', label: '9 PM', amount: 41200 },
  ],
  '1W': [
    { date: 'Mon', label: 'Oct 25', amount: 18400 },
    { date: 'Tue', label: 'Oct 26', amount: 24200 },
    { date: 'Wed', label: 'Oct 27', amount: 19800 },
    { date: 'Thu', label: 'Oct 28', amount: 38900 },
    { date: 'Fri', label: 'Oct 29', amount: 32400 },
    { date: 'Sat', label: 'Oct 30', amount: 47800 },
    { date: 'Sun', label: 'Oct 31', amount: 41200 },
  ],
  '1M': [
    { date: 'Oct 01', label: 'Oct 1', amount: 22400 },
    { date: 'Oct 04', label: 'Oct 4', amount: 31200 },
    { date: 'Oct 07', label: 'Oct 7', amount: 28500 },
    { date: 'Oct 10', label: 'Oct 10', amount: 19400 },
    { date: 'Oct 13', label: 'Oct 13', amount: 43600 },
    { date: 'Oct 16', label: 'Oct 16', amount: 37800 },
    { date: 'Oct 19', label: 'Oct 19', amount: 26500 },
    { date: 'Oct 22', label: 'Oct 22', amount: 49800 },
    { date: 'Oct 25', label: 'Oct 25', amount: 34200 },
    { date: 'Oct 28', label: 'Oct 28', amount: 48900 },
    { date: 'Oct 31', label: 'Oct 31', amount: 41200 },
  ],
  '3M': [
    { date: 'Aug W1', label: 'Aug 1-7', amount: 112000 },
    { date: 'Aug W2', label: 'Aug 8-14', amount: 134000 },
    { date: 'Aug W3', label: 'Aug 15-21', amount: 148000 },
    { date: 'Aug W4', label: 'Aug 22-28', amount: 129000 },
    { date: 'Sep W1', label: 'Sep 1-7', amount: 156000 },
    { date: 'Sep W2', label: 'Sep 8-14', amount: 142000 },
    { date: 'Sep W3', label: 'Sep 15-21', amount: 168000 },
    { date: 'Sep W4', label: 'Sep 22-28', amount: 159000 },
    { date: 'Oct W1', label: 'Oct 1-7', amount: 172000 },
    { date: 'Oct W2', label: 'Oct 8-14', amount: 185000 },
    { date: 'Oct W3', label: 'Oct 15-21', amount: 164000 },
    { date: 'Oct W4', label: 'Oct 22-31', amount: 198000 },
  ],
  'All': [
    { date: 'May', label: 'May 2026', amount: 410000 },
    { date: 'Jun', label: 'Jun 2026', amount: 480000 },
    { date: 'Jul', label: 'Jul 2026', amount: 520000 },
    { date: 'Aug', label: 'Aug 2026', amount: 531000 },
    { date: 'Sep', label: 'Sep 2026', amount: 625000 },
    { date: 'Oct', label: 'Oct 2026', amount: 719000 },
  ],
};

// 12-week calendar heatmap (84 days)
export function generateHeatmapData(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const today = new Date('2026-10-31T12:00:00Z');
  
  for (let w = 11; w >= 0; w--) {
    for (let d = 0; d < 7; d++) {
      const dayOffset = w * 7 + (6 - d);
      const dayDate = new Date(today);
      dayDate.setDate(dayDate.getDate() - dayOffset);
      const dateStr = dayDate.toISOString().split('T')[0];

      // Logic: Sundays no payout (none), most days paid (blue), 3 delayed/failed
      let status: 'none' | 'paid' | 'delayed' | 'failed' = 'none';
      let amount: number | undefined = undefined;

      if (d === 0) {
        status = 'none'; // Sunday holiday
      } else if (w === 0 && d === 5) {
        status = 'failed'; // Recent IFSC merger holdback
        amount = 4735.54;
      } else if (w === 2 && d === 3) {
        status = 'delayed'; // Delayed IMPS clearing
        amount = 17770.48;
      } else if (w === 5 && d === 2) {
        status = 'delayed'; // NPCI holiday buffer
        amount = 9289.00;
      } else {
        status = 'paid';
        amount = 12000 + ((w * 7 + d) * 380) % 25000;
      }

      days.push({
        date: dateStr,
        dayOfWeek: d,
        weekIndex: 11 - w,
        status,
        amount,
        settlementId: status !== 'none' ? `STL-2026-${w}${d}` : undefined,
      });
    }
  }
  return days;
}

export const OPEN_DISPUTES: DisputeItem[] = [
  {
    id: 'dsp-1',
    disputeId: 'DSP-8500-UPI',
    amount: 8500,
    customerName: 'Aman Verma',
    reason: 'Customer claims goods not delivered',
    dueDate: 'In 48 hours (Nov 02)',
    daysRemaining: 2,
    priority: 'high',
    evidenceUploaded: 2,
    evidenceRequired: 2,
    status: 'Open',
  },
  {
    id: 'dsp-2',
    disputeId: 'DSP-3200-CC',
    amount: 3200,
    customerName: 'Kavita Joshi',
    reason: 'Duplicate billing charged on Soundbox',
    dueDate: 'In 5 days (Nov 05)',
    daysRemaining: 5,
    priority: 'medium',
    evidenceUploaded: 1,
    evidenceRequired: 2,
    status: 'Open',
  },
  {
    id: 'dsp-3',
    disputeId: 'DSP-1450-UPI',
    amount: 1450,
    customerName: 'Rajeev Sen',
    reason: 'Wrong QR scanned at billing counter',
    dueDate: 'In 8 days (Nov 08)',
    daysRemaining: 8,
    priority: 'low',
    evidenceUploaded: 0,
    evidenceRequired: 1,
    status: 'Open',
  },
  {
    id: 'dsp-4',
    disputeId: 'DSP-4900-DC',
    amount: 4900,
    customerName: 'Pooja Nair',
    reason: 'Bank rejected initial tax invoice format',
    dueDate: 'In 3 days (Nov 03)',
    daysRemaining: 3,
    priority: 'high',
    evidenceUploaded: 1,
    evidenceRequired: 2,
    status: 'Open',
  },
  {
    id: 'dsp-5',
    disputeId: 'DSP-890-UPI',
    amount: 890,
    customerName: 'Deepak Rao',
    reason: 'Pending merchant delivery confirmation',
    dueDate: 'In 11 days (Nov 11)',
    daysRemaining: 11,
    priority: 'low',
    evidenceUploaded: 1,
    evidenceRequired: 1,
    status: 'Under Review',
  },
];

export const RECENT_SETTLEMENTS: SettlementTransaction[] = [
  {
    id: 'stl-1',
    settlementId: 'STL-2026-HDFC-9921',
    bankName: 'HDFC Bank',
    accountLast4: '4821',
    utr: 'UTR-HDFC-89201984210',
    amount: 41200.00,
    gross: 43250.00,
    status: 'paid',
    date: 'Today, 06:30 AM',
    breakdown: {
      commission: 1297.50,
      gst: 233.50,
      soundbox: 125.00,
      refunds: 394.00,
      chargebacks: 0,
    },
  },
  {
    id: 'stl-2',
    settlementId: 'STL-2026-HDFC-8812',
    bankName: 'HDFC Bank',
    accountLast4: '4821',
    utr: 'UTR-PENDING-HOLD',
    amount: 4735.54,
    gross: 4850.00,
    status: 'failed',
    date: 'Yesterday, 07:00 AM',
    failureReason: 'Beneficiary bank rejected IMPS: IFSC code changed due to bank branch merger',
    breakdown: {
      commission: 97.00,
      gst: 17.46,
      soundbox: 0,
      refunds: 0,
      chargebacks: 0,
    },
  },
  {
    id: 'stl-3',
    settlementId: 'STL-2026-HDFC-7703',
    bankName: 'HDFC Bank',
    accountLast4: '4821',
    utr: 'UTR-HDFC-77918239014',
    amount: 17770.48,
    gross: 18200.00,
    status: 'delayed',
    date: 'Oct 29, 2026',
    breakdown: {
      commission: 364.00,
      gst: 65.52,
      soundbox: 0,
      refunds: 0,
      chargebacks: 0,
    },
  },
  {
    id: 'stl-4',
    settlementId: 'STL-2026-HDFC-6604',
    bankName: 'HDFC Bank',
    accountLast4: '4821',
    utr: 'UTR-HDFC-66109283741',
    amount: 9289.00,
    gross: 10000.00,
    status: 'paid',
    date: 'Oct 28, 2026',
    breakdown: {
      commission: 200.00,
      gst: 36.00,
      soundbox: 125.00,
      refunds: 350.00,
      chargebacks: 0,
    },
  },
  {
    id: 'stl-5',
    settlementId: 'STL-2026-HDFC-5505',
    bankName: 'HDFC Bank',
    accountLast4: '4821',
    utr: 'UTR-HDFC-55910293847',
    amount: 28450.00,
    gross: 29500.00,
    status: 'paid',
    date: 'Oct 27, 2026',
    breakdown: {
      commission: 590.00,
      gst: 106.20,
      soundbox: 0,
      refunds: 353.80,
      chargebacks: 0,
    },
  },
];

export const CALM_ALERT = {
  type: 'settlement_failed' as const,
  settlementId: 'STL-2026-HDFC-8812',
  amount: 4735.54,
  message: 'Payout of ₹4,735.54 held by bank due to HDFC branch IFSC merger. Sulajh AI is auto-rerouting.',
  actionLabel: 'Chat with Sulajh AI',
};
