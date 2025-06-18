import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export function PerformanceChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  const { data: workers } = useQuery({
    queryKey: ["/api/workers"],
    select: (data: any) => data || [],
  });

  useEffect(() => {
    if (!canvasRef.current || !workers) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Prepare data for top 5 workers
    const topWorkers = workers
      .slice(0, 5)
      .map((worker: any) => ({
        name: worker.user?.name?.split(' ')[0] || 'Unknown',
        rating: parseFloat(worker.rating || '0'),
        jobs: worker.completedJobs || 0
      }));

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topWorkers.map(w => w.name),
        datasets: [
          {
            label: 'Rating',
            data: topWorkers.map(w => w.rating),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 8,
            yAxisID: 'y',
          },
          {
            label: 'Jobs Completed',
            data: topWorkers.map(w => w.jobs),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1,
            borderRadius: 8,
            yAxisID: 'y1',
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: false
          }
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(148, 163, 184, 0.3)'
            },
            ticks: {
              color: 'rgba(71, 85, 105, 0.8)'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            min: 0,
            max: 5,
            grid: {
              color: 'rgba(148, 163, 184, 0.3)'
            },
            ticks: {
              color: 'rgba(71, 85, 105, 0.8)'
            },
            title: {
              display: true,
              text: 'Rating (1-5)'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: 'rgba(71, 85, 105, 0.8)'
            },
            title: {
              display: true,
              text: 'Jobs Completed'
            }
          },
        }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [workers]);

  return (
    <div className="relative h-64 w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}
