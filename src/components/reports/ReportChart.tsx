
import React, { useEffect, useState } from 'react';
import { Report } from '@/types/report';
import { useLanguage } from '@/context/LanguageContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { fetchReportById } from '@/services/reportService';
import { toast } from 'sonner';

interface ReportChartProps {
  report: Report;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const ReportChart: React.FC<ReportChartProps> = ({ report }) => {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (report.id) {
          // Hesabatı tam məlumatlarla əldə edək
          const fullReport = await fetchReportById(report.id);
          
          if (fullReport && fullReport.content && fullReport.content.data) {
            // Əgər verilənlər birbaşa reportda varsa
            setChartData(fullReport.content.data);
          } else {
            // Mock data istifadə edək
            setDefaultChartData(report.type);
          }
        } else {
          // Hesabat ID-si yoxdursa mock data təyin edək
          setDefaultChartData(report.type);
        }
      } catch (error) {
        console.error('Report data loading error:', error);
        setDefaultChartData(report.type);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [report.id, report.type]);
  
  // Hesabat növünə uyğun olaraq mock data hazırlayaq
  const setDefaultChartData = (reportType: string) => {
    switch (reportType) {
      case 'statistics':
        setChartData([
          { name: 'Bakı', value: 400, count: 120 },
          { name: 'Sumqayıt', value: 300, count: 80 },
          { name: 'Gəncə', value: 300, count: 70 },
          { name: 'Şəki', value: 200, count: 50 },
          { name: 'Lənkəran', value: 278, count: 60 },
          { name: 'Quba', value: 189, count: 40 }
        ]);
        break;
      case 'completion':
        setChartData([
          { name: 'Tamamlanmış', value: 68 },
          { name: 'Gözləyən', value: 23 },
          { name: 'Rədd edilmiş', value: 9 }
        ]);
        break;
      case 'comparison':
        setChartData([
          { name: 'Bakı', value: 400, count: 120 },
          { name: 'Sumqayıt', value: 300, count: 80 },
          { name: 'Gəncə', value: 300, count: 70 },
          { name: 'Şəki', value: 200, count: 50 },
          { name: 'Lənkəran', value: 278, count: 60 },
          { name: 'Quba', value: 189, count: 40 }
        ]);
        break;
      default:
        setChartData([
          { name: 'Yanvar', value: 40 },
          { name: 'Fevral', value: 45 },
          { name: 'Mart', value: 60 },
          { name: 'Aprel', value: 90 },
          { name: 'May', value: 120 },
          { name: 'İyun', value: 145 }
        ]);
    }
  };
  
  // Yükləmə göstəricisi
  if (loading) {
    return (
      <div className="flex justify-center items-center h-56">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Hesabat növünə görə müxtəlif qrafiklər göstər
  const renderChart = () => {
    switch (report.type) {
      case 'statistics':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#0088FE" name={t('value')} />
              <Bar dataKey="count" fill="#00C49F" name={t('count')} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'completion':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'comparison':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name={t('value')} />
              <Bar dataKey="count" fill="#82ca9d" name={t('count')} />
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'custom':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="font-medium text-lg mb-1">{report.title || report.name}</h3>
        {report.summary && (
          <p className="text-sm text-muted-foreground">{report.summary}</p>
        )}
      </div>
      
      {renderChart()}
    </div>
  );
};

export default ReportChart;
