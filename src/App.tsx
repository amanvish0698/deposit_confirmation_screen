/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Menu, 
  Video, 
  Bell, 
  ChevronDown, 
  Save,
  CheckSquare,
  Square,
  Send,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

interface CallConnectDetails {
  customerName: string;
  mobileNumber: string;
  date: string;
  time: string;
}

interface CallOutcome {
  numberCorrect: 'Yes' | 'No' | '';
  lastAmountPaidCorrect: 'Yes' | 'No' | 'Not aware' | '';
  lastPaidDateCorrect: 'Yes' | 'No' | 'Not aware' | '';
  anyOtherInfo: string;
}

interface ActionRow {
  id: string;
  callConnect: CallConnectDetails;
  callOutcome: CallOutcome;
  isSaved: boolean;
  systemDateTime?: string;
}

interface LoanAccount {
  id: string;
  srNo: number;
  acStatus: string;
  hlNo: string;
  applicantName: string;
  emiAmount: number;
  overdueAmount: number;
  dpd: number;
  lastPaidAmount: number;
  dateOfPayment: string;
  customerAddress: string;
  allocatedTo: string;
  name: string;
  branch: string;
  state: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'None';
  approverRemarks?: string;
  isSelected: boolean;
  actionRows: ActionRow[];
}

const MOCK_DATA: LoanAccount[] = [
  {
    id: '1',
    srNo: 1,
    acStatus: 'Active',
    hlNo: 'HL0012345',
    applicantName: 'John Doe',
    emiAmount: 15000,
    overdueAmount: 0,
    dpd: 0,
    lastPaidAmount: 15000,
    dateOfPayment: '2025-12-15',
    customerAddress: '123 Main St, Springfield',
    allocatedTo: 'FE001 - Alice Smith',
    name: 'Alice Smith',
    branch: 'Main Branch',
    state: 'Illinois',
    status: 'None',
    isSelected: false,
    actionRows: [
      {
        id: 'ar1',
        callConnect: { customerName: '', mobileNumber: '', date: '', time: '' },
        callOutcome: { numberCorrect: '', lastAmountPaidCorrect: '', lastPaidDateCorrect: '', anyOtherInfo: '' },
        isSaved: false
      }
    ]
  },
  {
    id: '2',
    srNo: 2,
    acStatus: 'Overdue',
    hlNo: 'HL0067890',
    applicantName: 'Jane Smith',
    emiAmount: 12000,
    overdueAmount: 12000,
    dpd: 30,
    lastPaidAmount: 0,
    dateOfPayment: '2025-11-15',
    customerAddress: '456 Oak Ave, Metropolis',
    allocatedTo: 'FE002 - Bob Johnson',
    name: 'Bob Johnson',
    branch: 'North Branch',
    state: 'New York',
    status: 'None',
    isSelected: false,
    actionRows: [
      {
        id: 'ar2',
        callConnect: { customerName: '', mobileNumber: '', date: '', time: '' },
        callOutcome: { numberCorrect: '', lastAmountPaidCorrect: '', lastPaidDateCorrect: '', anyOtherInfo: '' },
        isSaved: false
      }
    ]
  }
];

const CUSTOMER_LIST = [
  { name: 'John Doe', mobile: '9876543210' },
  { name: 'Jane Smith', mobile: '8765432109' },
  { name: 'Co-Applicant A', mobile: '7654321098' }
];

export default function App() {
  const [accounts, setAccounts] = useState<LoanAccount[]>(MOCK_DATA);

  const handleCallConnectChange = (accId: string, rowId: string, field: keyof CallConnectDetails, value: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accId) {
        const newActionRows = acc.actionRows.map(row => {
          if (row.id === rowId) {
            const newCallConnect = { ...row.callConnect, [field]: value };
            if (field === 'customerName') {
              const customer = CUSTOMER_LIST.find(c => c.name === value);
              newCallConnect.mobileNumber = customer ? customer.mobile : '';
            }
            return { ...row, callConnect: newCallConnect };
          }
          return row;
        });
        return { ...acc, actionRows: newActionRows };
      }
      return acc;
    }));
  };

  const handleCallOutcomeChange = (accId: string, rowId: string, field: keyof CallOutcome, value: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accId) {
        const newActionRows = acc.actionRows.map(row => {
          if (row.id === rowId) {
            return { ...row, callOutcome: { ...row.callOutcome, [field]: value } };
          }
          return row;
        });
        return { ...acc, actionRows: newActionRows };
      }
      return acc;
    }));
  };

  const validateDate = (dateStr: string) => {
    if (!dateStr) return true;
    const selectedDate = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diff = Math.abs(selectedDate - now);
    const fortyEightHours = 48 * 60 * 60 * 1000;
    return diff <= fortyEightHours;
  };

  const isOutcomeMandatory = (outcome: CallOutcome) => {
    return outcome.numberCorrect === 'No' || 
           outcome.lastAmountPaidCorrect === 'No' || 
           outcome.lastAmountPaidCorrect === 'Not aware' ||
           outcome.lastPaidDateCorrect === 'No' ||
           outcome.lastPaidDateCorrect === 'Not aware';
  };

  const handleSave = (accId: string, rowId: string) => {
    const acc = accounts.find(a => a.id === accId);
    const row = acc?.actionRows.find(r => r.id === rowId);
    if (!row) return;

    if (!validateDate(row.callConnect.date)) {
      alert('Date must be within +/- 48 hours of current time.');
      return;
    }

    if (isOutcomeMandatory(row.callOutcome) && !row.callOutcome.anyOtherInfo.trim()) {
      alert('Any Other Information is mandatory when discrepancies are found.');
      return;
    }

    if (!row.callConnect.customerName || !row.callConnect.date || !row.callConnect.time) {
      alert('Please fill all Call Connect details.');
      return;
    }

    setAccounts(prev => prev.map(a => {
      if (a.id === accId) {
        const newActionRows = a.actionRows.map(r => {
          if (r.id === rowId) {
            return { 
              ...r, 
              isSaved: true, 
              systemDateTime: new Date().toLocaleString()
            };
          }
          return r;
        });
        return { ...a, actionRows: newActionRows, status: 'Pending' };
      }
      return a;
    }));
  };

  const handleAddRow = (accId: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accId) {
        const newRow: ActionRow = {
          id: Math.random().toString(36).substr(2, 9),
          callConnect: { customerName: '', mobileNumber: '', date: '', time: '' },
          callOutcome: { numberCorrect: '', lastAmountPaidCorrect: '', lastPaidDateCorrect: '', anyOtherInfo: '' },
          isSaved: false
        };
        return { ...acc, actionRows: [...acc.actionRows, newRow] };
      }
      return acc;
    }));
  };

  const handleSelect = (id: string) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id === id) {
        return { ...acc, isSelected: !acc.isSelected };
      }
      return acc;
    }));
  };

  const handleSubmitAll = () => {
    const selectedCount = accounts.filter(a => a.isSelected && a.actionRows.some(r => r.isSaved)).length;
    if (selectedCount === 0) {
      alert('Please select records with saved entries to submit.');
      return;
    }
    alert(`Submitted ${selectedCount} records for approval.`);
    setAccounts(prev => prev.map(acc => {
      if (acc.isSelected && acc.actionRows.some(r => r.isSaved)) {
        return { ...acc, isSelected: false, status: 'Pending' };
      }
      return acc;
    }));
  };

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans text-gray-800">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
          <h1 className="text-xl font-medium text-gray-600">Deposit Confirmation – Maker Screen</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Video className="w-4 h-4" />
            Help Video
          </button>
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <button className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-sm border border-orange-200">
            A
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 space-y-6 max-w-[1900px] mx-auto">
        
        {/* Filter Section */}
        <section className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div className="max-w-xs">
            <div className="relative">
              <select className="w-full appearance-none bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Filter by User Name</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="bg-[#002878] text-white px-6 py-1.5 rounded text-sm font-medium hover:bg-[#001d5a] transition-colors flex items-center gap-2">
              Go
            </button>
            <button className="border border-gray-300 px-6 py-1.5 rounded text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
              Reset
            </button>
          </div>
        </section>

        {/* Focus Badge & Submit Button */}
        <div className="flex justify-between items-center">
          <span className="bg-[#ffb400] text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1 w-fit">
            <span className="text-lg leading-none">*</span> Focus
          </span>
          <button 
            onClick={handleSubmitAll}
            className="bg-[#1e6b4d] text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2 hover:bg-[#154d37] transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
            Submit for Approval
          </button>
        </div>

        {/* Tables Container */}
        <div className="space-y-8">
          {accounts.map((acc) => (
            <div key={acc.id} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[10px] border-collapse min-w-[1800px]">
                  <thead>
                    <tr className="bg-gray-50 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                      <th className="px-2 py-3 border-r border-gray-200 w-10 text-center">Select</th>
                      <th className="px-2 py-3 border-r border-gray-200">Sr. No.</th>
                      <th className="px-2 py-3 border-r border-gray-200">A/c Status</th>
                      <th className="px-2 py-3 border-r border-gray-200">HL No.</th>
                      <th className="px-2 py-3 border-r border-gray-200">Applicant Name</th>
                      <th className="px-2 py-3 border-r border-gray-200">EMI Amount</th>
                      <th className="px-2 py-3 border-r border-gray-200">Overdue Amount</th>
                      <th className="px-2 py-3 border-r border-gray-200">DPD</th>
                      <th className="px-2 py-3 border-r border-gray-200">Last Paid Amount</th>
                      <th className="px-2 py-3 border-r border-gray-200">Date of Payment</th>
                      <th className="px-2 py-3 border-r border-gray-200">Customer Address</th>
                      <th className="px-2 py-3 border-r border-gray-200">Allocated To</th>
                      <th className="px-2 py-3 border-r border-gray-200">Name</th>
                      <th className="px-2 py-3 border-r border-gray-200">Branch</th>
                      <th className="px-2 py-3 border-r border-gray-200">State</th>
                      <th className="px-2 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* View-Only Header Row (Blue) */}
                    <tr className="bg-[#d9e2e8] text-gray-900 font-bold">
                      <td className="px-2 py-3 border-r border-white/50 text-center">
                        <button 
                          onClick={() => handleSelect(acc.id)}
                          className={`p-1 rounded transition-colors ${acc.isSelected ? 'text-blue-700' : 'text-gray-500'}`}
                        >
                          {acc.isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.srNo}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.acStatus}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.hlNo}</td>
                      <td className="px-2 py-3 border-r border-white/50 uppercase">{acc.applicantName}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.emiAmount.toLocaleString()}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.overdueAmount.toLocaleString()}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.dpd}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.lastPaidAmount.toLocaleString()}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.dateOfPayment}</td>
                      <td className="px-2 py-3 border-r border-white/50 max-w-[150px] truncate" title={acc.customerAddress}>{acc.customerAddress}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.allocatedTo}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.name}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.branch}</td>
                      <td className="px-2 py-3 border-r border-white/50">{acc.state}</td>
                      <td className="px-2 py-3">
                        <div className="flex flex-col">
                          <span className={`font-bold ${acc.status === 'Approved' ? 'text-green-700' : acc.status === 'Rejected' ? 'text-red-700' : 'text-orange-700'}`}>
                            {acc.status !== 'None' ? acc.status : ''}
                          </span>
                          {acc.approverRemarks && <span className="text-[8px] italic">"{acc.approverRemarks}"</span>}
                        </div>
                      </td>
                    </tr>

                    {/* Action Row Header (White) */}
                    <tr className="bg-white text-gray-700 font-bold border-b border-gray-100">
                      <td colSpan={1} className="border-r border-gray-100"></td>
                      <td className="px-2 py-2 border-r border-gray-100 italic">Customer Name</td>
                      <td className="px-2 py-2 border-r border-gray-100 italic">M.No.</td>
                      <td className="px-2 py-2 border-r border-gray-100 italic">Date</td>
                      <td className="px-2 py-2 border-r border-gray-100 italic">Time</td>
                      <td className="px-2 py-2 border-r border-gray-100 italic">No. Correct</td>
                      <td className="px-2 py-2 border-r border-gray-100 italic">Last Amt Paid is Correct</td>
                      <td className="px-2 py-2 border-r border-gray-100 italic">Last Amt Paid date is correct</td>
                      <td className="px-2 py-2 border-r border-gray-100 italic">Any other information</td>
                      <td className="px-2 py-2 border-r border-gray-100 italic">SAVE</td>
                      <td className="px-2 py-2 italic">update at(Time stamp)</td>
                      <td colSpan={5} className="text-right px-4">
                        <button 
                          onClick={() => handleAddRow(acc.id)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-auto font-bold uppercase text-[9px]"
                        >
                          <Plus className="w-3 h-3" /> Add Row
                        </button>
                      </td>
                    </tr>

                    {/* Action Rows (White) */}
                    {acc.actionRows.map((row) => (
                      <tr key={row.id} className="bg-white text-gray-600 border-b border-gray-50">
                        <td className="border-r border-gray-50"></td>
                        <td className="px-2 py-2 border-r border-gray-50">
                          <select 
                            disabled={row.isSaved}
                            value={row.callConnect.customerName}
                            onChange={(e) => handleCallConnectChange(acc.id, row.id, 'customerName', e.target.value)}
                            className="w-full bg-transparent border border-gray-200 rounded px-1 py-0.5 outline-none focus:border-blue-400 disabled:bg-gray-50"
                          >
                            <option value="">Select</option>
                            {CUSTOMER_LIST.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                          </select>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-50">
                          <input type="text" readOnly value={row.callConnect.mobileNumber} className="w-full bg-gray-50 border-none outline-none" />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-50">
                          <input 
                            type="date" 
                            disabled={row.isSaved}
                            value={row.callConnect.date}
                            onChange={(e) => handleCallConnectChange(acc.id, row.id, 'date', e.target.value)}
                            className="w-full bg-transparent border border-gray-200 rounded px-1 py-0.5 outline-none disabled:bg-gray-50"
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-50">
                          <input 
                            type="time" 
                            disabled={row.isSaved}
                            value={row.callConnect.time}
                            onChange={(e) => handleCallConnectChange(acc.id, row.id, 'time', e.target.value)}
                            className="w-full bg-transparent border border-gray-200 rounded px-1 py-0.5 outline-none disabled:bg-gray-50"
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-50">
                          <select 
                            disabled={row.isSaved}
                            value={row.callOutcome.numberCorrect}
                            onChange={(e) => handleCallOutcomeChange(acc.id, row.id, 'numberCorrect', e.target.value)}
                            className="w-full bg-transparent border border-gray-200 rounded px-1 py-0.5 outline-none disabled:bg-gray-50"
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-50">
                          <select 
                            disabled={row.isSaved}
                            value={row.callOutcome.lastAmountPaidCorrect}
                            onChange={(e) => handleCallOutcomeChange(acc.id, row.id, 'lastAmountPaidCorrect', e.target.value)}
                            className="w-full bg-transparent border border-gray-200 rounded px-1 py-0.5 outline-none disabled:bg-gray-50"
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Not aware">Not aware</option>
                          </select>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-50">
                          <select 
                            disabled={row.isSaved}
                            value={row.callOutcome.lastPaidDateCorrect}
                            onChange={(e) => handleCallOutcomeChange(acc.id, row.id, 'lastPaidDateCorrect', e.target.value)}
                            className="w-full bg-transparent border border-gray-200 rounded px-1 py-0.5 outline-none disabled:bg-gray-50"
                          >
                            <option value="">Select</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Not aware">Not aware</option>
                          </select>
                        </td>
                        <td className="px-2 py-2 border-r border-gray-50">
                          <input 
                            type="text" 
                            disabled={row.isSaved}
                            value={row.callOutcome.anyOtherInfo}
                            onChange={(e) => handleCallOutcomeChange(acc.id, row.id, 'anyOtherInfo', e.target.value)}
                            placeholder={isOutcomeMandatory(row.callOutcome) ? "Mandatory*" : "Optional"}
                            className="w-full bg-transparent border border-gray-200 rounded px-1 py-0.5 outline-none disabled:bg-gray-50"
                          />
                        </td>
                        <td className="px-2 py-2 border-r border-gray-50">
                          <button 
                            onClick={() => handleSave(acc.id, row.id)}
                            disabled={row.isSaved}
                            className={`px-3 py-1 rounded font-bold uppercase text-[9px] transition-colors ${row.isSaved ? 'bg-gray-100 text-gray-400' : 'bg-[#002878] text-white hover:bg-[#001d5a]'}`}
                          >
                            {row.isSaved ? 'Saved' : 'Save'}
                          </button>
                        </td>
                        <td className="px-2 py-2 text-[9px] font-medium text-gray-500">
                          {row.systemDateTime || '-'}
                        </td>
                        <td colSpan={5}></td>
                      </tr>
                    ))}

                    {/* Declaration Row */}
                    <tr className="bg-blue-50/50">
                      <td colSpan={16} className="px-4 py-2">
                        <p className="text-[9px] text-gray-500 italic">
                          "We confirm that above data is correct & there is no complaint about Non or less Deposit of Amount in any customer account to whom we have spoken with."
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
