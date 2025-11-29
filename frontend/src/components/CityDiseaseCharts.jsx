// City-wide Disease Charts - Shows trends and metrics
import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

Chart.register(...registerables);

function CityDiseaseCharts({ cityData }) {
  const diseaseChartRef = useRef(null);
  const capacityChartRef = useRef(null);
  const zoneChartRef = useRef(null);
  
  const diseaseChartInstance = useRef(null);
  const capacityChartInstance = useRef(null);
  const zoneChartInstance = useRef(null);

  // Extract disease data from labs
  const getDiseaseData = () => {
    if (!cityData || !cityData.labs) return null;

    const diseases = {
      dengue: 0,
      malaria: 0,
      covid: 0,
      typhoid: 0,
      influenza: 0
    };

    Object.values(cityData.labs).forEach((lab) => {
      const results = lab.currentState?.testResults || lab.testResults || {};
      Object.keys(diseases).forEach((disease) => {
        diseases[disease] += results[disease] || 0;
      });
    });

    return diseases;
  };

  // Extract capacity data from hospitals
  const getCapacityData = () => {
    if (!cityData || !cityData.hospitals) return null;

    let totalBeds = 0;
    let usedBeds = 0;
    let totalICU = 0;
    let usedICU = 0;

    Object.values(cityData.hospitals).forEach((hospital) => {
      const beds = hospital.currentState?.beds || hospital.beds || {};
      
      Object.values(beds).forEach((bedType) => {
        if (bedType.total && typeof bedType.total === 'number') {
          if (bedType.type === 'icu' || bedType.type === 'ICU') {
            totalICU += bedType.total;
            usedICU += bedType.used || 0;
          } else {
            totalBeds += bedType.total;
            usedBeds += bedType.used || 0;
          }
        }
      });
    });

    return {
      totalBeds,
      usedBeds,
      availableBeds: totalBeds - usedBeds,
      totalICU,
      usedICU,
      availableICU: totalICU - usedICU
    };
  };

  // Extract zone-wise risk data
  const getZoneData = () => {
    if (!cityData) return null;

    const zones = ['Zone-1', 'Zone-2', 'Zone-3'];
    const zoneData = {};

    zones.forEach((zone) => {
      let hospitalCount = 0;
      let labCount = 0;
      let pharmacyCount = 0;
      let totalTests = 0;

      // Count entities in zone
      if (cityData.hospitals) {
        hospitalCount = Object.values(cityData.hospitals).filter(h => h.zone === zone).length;
      }
      if (cityData.labs) {
        const zoneLabs = Object.values(cityData.labs).filter(l => l.zone === zone);
        labCount = zoneLabs.length;
        zoneLabs.forEach((lab) => {
          const results = lab.currentState?.testResults || lab.testResults || {};
          totalTests += Object.values(results).reduce((sum, val) => sum + (val || 0), 0);
        });
      }
      if (cityData.pharmacies) {
        pharmacyCount = Object.values(cityData.pharmacies).filter(p => p.zone === zone).length;
      }

      zoneData[zone] = {
        hospitals: hospitalCount,
        labs: labCount,
        pharmacies: pharmacyCount,
        tests: totalTests
      };
    });

    return zoneData;
  };

  // Chart 1: Disease Distribution (Pie Chart)
  useEffect(() => {
    const diseaseData = getDiseaseData();
    if (!diseaseData || !diseaseChartRef.current) return;

    if (diseaseChartInstance.current) {
      diseaseChartInstance.current.destroy();
    }

    const ctx = diseaseChartRef.current.getContext('2d');
    diseaseChartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Dengue', 'Malaria', 'COVID-19', 'Typhoid', 'Influenza'],
        datasets: [{
          label: 'Test Cases',
          data: [
            diseaseData.dengue,
            diseaseData.malaria,
            diseaseData.covid,
            diseaseData.typhoid,
            diseaseData.influenza
          ],
          backgroundColor: [
            '#EF4444', // Red - Dengue
            '#F59E0B', // Orange - Malaria
            '#8B5CF6', // Purple - COVID
            '#3B82F6', // Blue - Typhoid
            '#10B981'  // Green - Influenza
          ],
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
              font: { size: 12 },
              padding: 15
            }
          },
          title: {
            display: true,
            text: 'City-wide Disease Distribution',
            color: '#F1F5F9',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value} tests (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (diseaseChartInstance.current) {
        diseaseChartInstance.current.destroy();
      }
    };
  }, [cityData]);

  // Chart 2: Hospital Capacity (Bar Chart)
  useEffect(() => {
    const capacityData = getCapacityData();
    if (!capacityData || !capacityChartRef.current) return;

    if (capacityChartInstance.current) {
      capacityChartInstance.current.destroy();
    }

    const ctx = capacityChartRef.current.getContext('2d');
    capacityChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['General Beds', 'ICU Beds'],
        datasets: [
          {
            label: 'Available',
            data: [capacityData.availableBeds, capacityData.availableICU],
            backgroundColor: '#10B981',
            borderColor: '#059669',
            borderWidth: 1
          },
          {
            label: 'Used',
            data: [capacityData.usedBeds, capacityData.usedICU],
            backgroundColor: '#EF4444',
            borderColor: '#DC2626',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: { color: '#94A3B8' },
            grid: { color: '#334155' }
          },
          y: {
            stacked: true,
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
              font: { size: 12 }
            }
          },
          title: {
            display: true,
            text: 'Hospital Bed Capacity',
            color: '#F1F5F9',
            font: { size: 16, weight: 'bold' }
          },
          tooltip: {
            callbacks: {
              afterLabel: function(context) {
                const datasetIndex = context.datasetIndex;
                const index = context.dataIndex;
                const total = index === 0 ? capacityData.totalBeds : capacityData.totalICU;
                const value = context.parsed.y;
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${percentage}% of total`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (capacityChartInstance.current) {
        capacityChartInstance.current.destroy();
      }
    };
  }, [cityData]);

  // Chart 3: Zone-wise Activity (Horizontal Bar Chart)
  useEffect(() => {
    const zoneData = getZoneData();
    if (!zoneData || !zoneChartRef.current) return;

    if (zoneChartInstance.current) {
      zoneChartInstance.current.destroy();
    }

    const zones = Object.keys(zoneData);
    const ctx = zoneChartRef.current.getContext('2d');
    
    zoneChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: zones,
        datasets: [
          {
            label: 'Hospitals',
            data: zones.map(z => zoneData[z].hospitals),
            backgroundColor: '#10B981',
            borderColor: '#059669',
            borderWidth: 1
          },
          {
            label: 'Labs',
            data: zones.map(z => zoneData[z].labs),
            backgroundColor: '#8B5CF6',
            borderColor: '#7C3AED',
            borderWidth: 1
          },
          {
            label: 'Pharmacies',
            data: zones.map(z => zoneData[z].pharmacies),
            backgroundColor: '#F59E0B',
            borderColor: '#D97706',
            borderWidth: 1
          },
          {
            label: 'Tests (÷100)',
            data: zones.map(z => Math.round(zoneData[z].tests / 100)),
            backgroundColor: '#3B82F6',
            borderColor: '#2563EB',
            borderWidth: 1
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            ticks: { color: '#94A3B8' },
            grid: { color: '#334155' }
          },
          y: {
            ticks: { color: '#94A3B8' },
            grid: { color: '#334155' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#CBD5E1',
              font: { size: 11 }
            }
          },
          title: {
            display: true,
            text: 'Zone-wise Healthcare Resources',
            color: '#F1F5F9',
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    });

    return () => {
      if (zoneChartInstance.current) {
        zoneChartInstance.current.destroy();
      }
    };
  }, [cityData]);

  if (!cityData) {
    return (
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <p className="text-slate-400">Loading charts...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disease Distribution Chart */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div style={{ height: '300px' }}>
          <canvas ref={diseaseChartRef}></canvas>
        </div>
      </div>

      {/* Capacity and Zone Charts Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hospital Capacity Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div style={{ height: '300px' }}>
            <canvas ref={capacityChartRef}></canvas>
          </div>
        </div>

        {/* Zone Activity Chart */}
        <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
          <div style={{ height: '300px' }}>
            <canvas ref={zoneChartRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CityDiseaseCharts;

