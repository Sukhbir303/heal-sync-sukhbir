// Enhanced City Charts - Line graphs and additional visualizations
import { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

function CityEnhancedCharts({ cityData, metricsHistory }) {
  const diseaseTrendRef = useRef(null);
  const medicineStockRef = useRef(null);
  const supplyChainRef = useRef(null);
  const zoneResourcesRef = useRef(null);
  
  const diseaseTrendInstance = useRef(null);
  const medicineStockInstance = useRef(null);
  const supplyChainInstance = useRef(null);
  const zoneResourcesInstance = useRef(null);

  const [trendData, setTrendData] = useState([]);

  // Simulate historical data (in real app, fetch from backend)
  useEffect(() => {
    if (!cityData) return;
    
    const now = Date.now();
    const history = [];
    for (let i = 10; i >= 0; i--) {
      const time = new Date(now - i * 60000); // Every minute
      const labs = cityData?.labs ? Object.values(cityData.labs) : [];
      
      let dengue = 0, malaria = 0, covid = 0;
      labs.forEach(lab => {
        const results = lab.currentState?.testResults || lab.testResults || {};
        dengue += results.dengue || 0;
        malaria += results.malaria || 0;
        covid += results.covid || 0;
      });

      history.push({
        time,
        dengue: dengue + Math.random() * 10,
        malaria: malaria + Math.random() * 5,
        covid: covid + Math.random() * 8
      });
    }
    setTrendData(history);
  }, [cityData]);

  // Chart 1: Disease Trend Line Graph
  useEffect(() => {
    if (!diseaseTrendRef.current || trendData.length === 0) return;

    if (diseaseTrendInstance.current) {
      diseaseTrendInstance.current.destroy();
    }

    const ctx = diseaseTrendRef.current.getContext('2d');
    diseaseTrendInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: trendData.map(d => d.time),
        datasets: [
          {
            label: 'Dengue',
            data: trendData.map(d => d.dengue),
            borderColor: '#EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'COVID-19',
            data: trendData.map(d => d.covid),
            borderColor: '#8B5CF6',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 6
          },
          {
            label: 'Malaria',
            data: trendData.map(d => d.malaria),
            borderColor: '#F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 3,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'minute',
              displayFormats: {
                minute: 'HH:mm'
              }
            },
            ticks: { color: '#94A3B8', maxRotation: 0 },
            grid: { color: '#334155' }
          },
          y: {
            beginAtZero: true,
            ticks: { color: '#94A3B8' },
            grid: { color: '#334155' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#CBD5E1',
              usePointStyle: true,
              padding: 15
            }
          },
          title: {
            display: true,
            text: '📈 Disease Trend (Last 10 Minutes)',
            color: '#F1F5F9',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            mode: 'index',
            intersect: false
          }
        }
      }
    });

    return () => {
      if (diseaseTrendInstance.current) {
        diseaseTrendInstance.current.destroy();
      }
    };
  }, [trendData]);

  // Chart 2: Medicine Stock Levels
  useEffect(() => {
    if (!medicineStockRef.current || !cityData?.pharmacies) return;

    if (medicineStockInstance.current) {
      medicineStockInstance.current.destroy();
    }

    const pharmacies = Object.values(cityData.pharmacies);
    const medicineTypes = ['paracetamol', 'antibiotics', 'antivirals', 'dengueMed', 'covidMed'];
    
    const stockData = medicineTypes.map(med => {
      let total = 0;
      pharmacies.forEach(pharmacy => {
        const medicines = pharmacy.currentState?.medicines || pharmacy.medicines || {};
        total += medicines[med]?.stock || 0;
      });
      return total;
    });

    const ctx = medicineStockRef.current.getContext('2d');
    medicineStockInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Paracetamol', 'Antibiotics', 'Antivirals', 'Dengue Med', 'COVID Med'],
        datasets: [{
          label: 'Total Stock (units)',
          data: stockData,
          backgroundColor: [
            '#10B981',
            '#3B82F6',
            '#8B5CF6',
            '#EF4444',
            '#F59E0B'
          ],
          borderColor: '#1E293B',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#94A3B8' },
            grid: { color: '#334155' }
          },
          x: {
            ticks: { color: '#94A3B8' },
            grid: { display: false }
          }
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: '💊 City-wide Medicine Stock Levels',
            color: '#F1F5F9',
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    });

    return () => {
      if (medicineStockInstance.current) {
        medicineStockInstance.current.destroy();
      }
    };
  }, [cityData]);

  // Chart 3: Supply Chain Status
  useEffect(() => {
    if (!supplyChainRef.current || !cityData) return;

    if (supplyChainInstance.current) {
      supplyChainInstance.current.destroy();
    }

    const hospitals = Object.keys(cityData.hospitals || {}).length;
    const labs = Object.keys(cityData.labs || {}).length;
    const pharmacies = Object.keys(cityData.pharmacies || {}).length;
    const suppliers = Object.keys(cityData.suppliers || {}).length;

    // Calculate operational status
    const totalEntities = hospitals + labs + pharmacies + suppliers;
    const operational = Math.round(totalEntities * 0.95); // 95% operational
    const maintenance = Math.round(totalEntities * 0.03); // 3% maintenance
    const offline = totalEntities - operational - maintenance;

    const ctx = supplyChainRef.current.getContext('2d');
    supplyChainInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Operational', 'Maintenance', 'Offline'],
        datasets: [{
          data: [operational, maintenance, offline],
          backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
          borderColor: '#1E293B',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#CBD5E1',
              padding: 15,
              font: { size: 12 }
            }
          },
          title: {
            display: true,
            text: '🔗 Supply Chain Status',
            color: '#F1F5F9',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} entities (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (supplyChainInstance.current) {
        supplyChainInstance.current.destroy();
      }
    };
  }, [cityData]);

  // Chart 4: Zone-wise Healthcare Resources
  useEffect(() => {
    if (!zoneResourcesRef.current || !cityData) return;

    if (zoneResourcesInstance.current) {
      zoneResourcesInstance.current.destroy();
    }

    const zones = ['Zone-1', 'Zone-2', 'Zone-3'];
    const zoneData = zones.map(zone => {
      let hospitalCount = 0;
      let labCount = 0;
      let pharmacyCount = 0;

      if (cityData.hospitals) {
        hospitalCount = Object.values(cityData.hospitals).filter(h => h.zone === zone).length;
      }
      if (cityData.labs) {
        labCount = Object.values(cityData.labs).filter(l => l.zone === zone).length;
      }
      if (cityData.pharmacies) {
        pharmacyCount = Object.values(cityData.pharmacies).filter(p => p.zone === zone).length;
      }

      return {
        hospitals: hospitalCount,
        labs: labCount,
        pharmacies: pharmacyCount
      };
    });

    const ctx = zoneResourcesRef.current.getContext('2d');
    zoneResourcesInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: zones,
        datasets: [
          {
            label: 'Hospitals',
            data: zoneData.map(z => z.hospitals),
            backgroundColor: '#10B981',
            borderColor: '#059669',
            borderWidth: 1
          },
          {
            label: 'Labs',
            data: zoneData.map(z => z.labs),
            backgroundColor: '#8B5CF6',
            borderColor: '#7C3AED',
            borderWidth: 1
          },
          {
            label: 'Pharmacies',
            data: zoneData.map(z => z.pharmacies),
            backgroundColor: '#F59E0B',
            borderColor: '#D97706',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#94A3B8', stepSize: 1 },
            grid: { color: '#334155' }
          },
          x: {
            ticks: { color: '#94A3B8' },
            grid: { display: false }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#CBD5E1',
              padding: 15,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: '🗺️ Zone-wise Healthcare Resources',
            color: '#F1F5F9',
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    });

    return () => {
      if (zoneResourcesInstance.current) {
        zoneResourcesInstance.current.destroy();
      }
    };
  }, [cityData]);

  if (!cityData) {
    return (
      <div className="text-slate-400 text-center py-8">
        Loading charts...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Disease Trend Line Graph */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div style={{ height: '280px' }}>
          <canvas ref={diseaseTrendRef}></canvas>
        </div>
      </div>

      {/* Zone-wise Resources */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div style={{ height: '280px' }}>
          <canvas ref={zoneResourcesRef}></canvas>
        </div>
      </div>

      {/* Medicine Stock Levels */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div style={{ height: '280px' }}>
          <canvas ref={medicineStockRef}></canvas>
        </div>
      </div>

      {/* Supply Chain Status */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div style={{ height: '280px' }}>
          <canvas ref={supplyChainRef}></canvas>
        </div>
      </div>
    </div>
  );
}

export default CityEnhancedCharts;

