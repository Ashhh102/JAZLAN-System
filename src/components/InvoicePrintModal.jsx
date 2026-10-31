import React from 'react';
import { Printer, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function InvoicePrintModal({ bill, customer, onClose }) {
  if (!bill) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (val) => {
    return '₹' + Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content modal-lg printable-invoice" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '820px', padding: '36px', backgroundColor: '#ffffff', color: '#0f172a' }}
      >
        {/* Modal Actions (Hidden on print) */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#64748b' }}>Invoice Preview:</span>
            <strong style={{ fontSize: '16px', color: '#059669' }}>{bill.bill_no}</strong>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary btn-sm" onClick={handlePrint}>
              <Printer size={15} />
              Print / Save PDF
            </button>
            <button className="modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PRINTABLE INVOICE BODY */}
        <div style={{ border: '2px solid #0f172a', padding: '24px', borderRadius: '4px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '18px', marginBottom: '18px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.5px', color: '#0f172a', margin: 0, textTransform: 'uppercase' }}>
                JAZLAN STEELS & TRADERS
              </h1>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginTop: '3px' }}>
                Authorized Wholesale & Retail Distributors of TMT Rebars & Structural Steel
              </p>
              <div style={{ fontSize: '11.5px', color: '#334155', marginTop: '6px', lineHeight: 1.4 }}>
                <div>National Highway Bypass, Opp. Industrial Estate, Trichy - 620015</div>
                <div><strong>GSTIN:</strong> 33AAACJ9021K1Z8 | <strong>Phone:</strong> +91 98421 88990</div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'inline-block', backgroundColor: '#0f172a', color: '#ffffff', padding: '6px 14px', borderRadius: '4px', fontSize: '13px', fontWeight: 800, letterSpacing: '1px' }}>
                TAX INVOICE
              </div>
              <div style={{ marginTop: '10px', fontSize: '18px', fontWeight: 900, fontFamily: 'monospace', color: '#059669' }}>
                {bill.bill_no}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                <strong>Date:</strong> {bill.date}
              </div>
              <div style={{ fontSize: '12px', color: '#475569' }}>
                <strong>Time:</strong> {bill.time}
              </div>
            </div>
          </div>

          {/* Customer & Vehicle Info Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', borderBottom: '1px solid #cbd5e1', paddingBottom: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' }}>
                BILLED TO:
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                {bill.customer_name}
              </div>
              {customer?.phone && (
                <div style={{ fontSize: '12px', color: '#334155', marginTop: '2px' }}>
                  <strong>Phone:</strong> {customer.phone}
                </div>
              )}
              {customer?.address && (
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong>Address:</strong> {customer.address}
                </div>
              )}
              {customer?.gstin && (
                <div style={{ fontSize: '12px', color: '#334155' }}>
                  <strong>GSTIN:</strong> {customer.gstin}
                </div>
              )}
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px' }}>
                DISPATCH & LOGISTICS:
              </div>
              <div style={{ fontSize: '12.5px', color: '#0f172a', marginBottom: '3px' }}>
                <strong>Vehicle No:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{bill.vehicle_number || 'Direct Customer Pickup'}</span>
              </div>
              <div style={{ fontSize: '12.5px', color: '#0f172a', marginBottom: '3px' }}>
                <strong>Payment Mode:</strong> {bill.payment_mode}
              </div>
              {bill.upi_reference && (
                <div style={{ fontSize: '12px', color: '#2563eb' }}>
                  <strong>Ref / Txn ID:</strong> {bill.upi_reference}
                </div>
              )}
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <strong>Billed By:</strong> {bill.biller_name || 'Admin'}
              </div>
            </div>
          </div>

          {/* Itemized Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f1f5f9', borderTop: '1px solid #0f172a', borderBottom: '1px solid #0f172a' }}>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11.5px', fontWeight: 800 }}>S.No</th>
                <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: '11.5px', fontWeight: 800 }}>Item Description</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '11.5px', fontWeight: 800 }}>Qty / Unit</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '11.5px', fontWeight: 800 }}>Rate (₹)</th>
                <th style={{ padding: '8px 10px', textAlign: 'right', fontSize: '11.5px', fontWeight: 800 }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '10px', fontSize: '12px' }}>1</td>
                <td style={{ padding: '10px', fontSize: '13px', fontWeight: 700 }}>
                  {bill.product_name}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace', fontWeight: 700 }}>
                  {bill.quantity} {bill.unit || 'Tons'}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontSize: '12.5px', fontFamily: 'monospace' }}>
                  {formatCurrency(bill.rate)}
                </td>
                <td style={{ padding: '10px', textAlign: 'right', fontSize: '13px', fontFamily: 'monospace', fontWeight: 800 }}>
                  {formatCurrency(bill.subtotal)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Totals & Tax Calculation Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px', alignItems: 'flex-start' }}>
            <div>
              {bill.notes && (
                <div style={{ padding: '8px 12px', backgroundColor: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '4px', fontSize: '11.5px', color: '#475569', marginBottom: '12px' }}>
                  <strong>Notes:</strong> {bill.notes}
                </div>
              )}
              <div style={{ fontSize: '11px', color: '#64748b', lineHeight: 1.5 }}>
                <div><strong>Terms & Conditions:</strong></div>
                <div>1. Goods once sold will not be taken back without valid approval.</div>
                <div>2. Interest @ 18% per annum will be charged on overdue payments.</div>
                <div>3. Subject to local jurisdiction only.</div>
              </div>
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                <span>Subtotal:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatCurrency(bill.subtotal)}</span>
              </div>
              {bill.rent_transport > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                  <span>Rent:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatCurrency(bill.rent_transport)}</span>
                </div>
              )}
              {bill.cgst_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '4px' }}>
                  <span>CGST ({bill.gst_rate / 2}%):</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatCurrency(bill.cgst_amount)}</span>
                </div>
              )}
              {bill.sgst_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#475569', marginBottom: '6px' }}>
                  <span>SGST ({bill.gst_rate / 2}%):</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{formatCurrency(bill.sgst_amount)}</span>
                </div>
              )}
              {bill.tds_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#dc2626', marginBottom: '6px' }}>
                  <span>Less TDS:</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>-{formatCurrency(bill.tds_amount)}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 900, color: '#0f172a', borderTop: '2px solid #0f172a', paddingTop: '8px', marginTop: '4px', marginBottom: '8px' }}>
                <span>Grand Total:</span>
                <span style={{ fontFamily: 'monospace', color: '#059669' }}>{formatCurrency(bill.total_amount)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#15803d', fontWeight: 700, marginBottom: '4px' }}>
                <span>Amount Received:</span>
                <span style={{ fontFamily: 'monospace' }}>{formatCurrency(bill.amount_received)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: bill.balance_due > 0 ? '#b91c1c' : '#15803d', fontWeight: 800 }}>
                <span>Balance Due:</span>
                <span style={{ fontFamily: 'monospace' }}>{formatCurrency(bill.balance_due)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '36px', paddingTop: '16px' }}>
            <div style={{ fontSize: '11px', color: '#64748b' }}>
              <div>Customer Signature: __________________</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '11px', color: '#0f172a' }}>
              <div style={{ fontWeight: 800 }}>For JAZLAN STEELS & TRADERS</div>
              <div style={{ height: '40px' }}></div>
              <div>Authorized Signatory</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
