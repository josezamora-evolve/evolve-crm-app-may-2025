interface BarChartData {
  name: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarChartData[];
  title: string;
}

export function SimpleBarChart({ data, title }: SimpleBarChartProps) {
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">{title}</h3>
        {data.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No hay datos disponibles</p>
        ) : (
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-600 truncate mr-3">
                  {item.name}
                </div>
                <div className="flex-1 flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 w-8 text-right">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
