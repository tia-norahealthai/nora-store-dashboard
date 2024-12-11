export default function DashboardPage() {
  // ... existing code ...

  return (
    <div>
      <div
        data-metrics
        data-revenue={metrics.revenue}
        data-active-users={metrics.activeUsers}
        data-conversion-rate={metrics.conversionRate}
        data-pending-orders={metrics.pendingOrders}
        data-total-orders={metrics.totalOrders}
      >
        {/* ... existing metrics UI ... */}
      </div>
    </div>
  )
} 