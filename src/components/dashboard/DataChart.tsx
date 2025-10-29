import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import {
  VictoryChart,
  VictoryLine,
  VictoryTheme,
  VictoryAxis,
} from 'victory-native';
import { colors } from '../../constants/colors';
import { VictoryStyleObject } from 'victory-core'; // Import the specific type

// Define a type for your chart data points for clarity
type ChartDataPoint = {
  x: number | Date;
  y: number;
};

interface DataChartProps {
  data: ChartDataPoint[];
  title: string;
}

// Define the theme structure with explicit types
type ChartTheme = {
  axis: {
    style: {
      axis: VictoryStyleObject;
      axisLabel: VictoryStyleObject;
      grid: VictoryStyleObject;
      tickLabels: VictoryStyleObject;
    };
  };
  line: {
    style: {
      data: VictoryStyleObject;
    };
  };
};

const DataChart: React.FC<DataChartProps> = ({ data, title }) => {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const textColor = isDarkMode ? colors.textLight : colors.textPrimary;
  const gridColor = isDarkMode ? colors.darkGray : colors.lightGray;
  const lineColor = colors.primary;

  // Define a type-safe theme based on the color scheme
  const chartTheme: ChartTheme = {
    axis: {
      style: {
        axis: {
          stroke: 'transparent', // Hide axis line
        },
        axisLabel: {
          fill: textColor,
          padding: 30,
          fontSize: 14,
          fontWeight: 'bold',
        },
        grid: {
          stroke: gridColor,
          strokeDasharray: '4',
        },
        tickLabels: {
          fill: textColor,
          fontSize: 10,
        },
      },
    },
    line: {
      style: {
        data: {
          stroke: lineColor,
          strokeWidth: 3,
        },
      },
    },
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      {data.length > 1 ? (
        <VictoryChart
          theme={chartTheme}
          height={220}
          padding={{ top: 20, bottom: 40, left: 40, right: 20 }}>
          <VictoryAxis dependentAxis />
          <VictoryAxis
            tickFormat={x =>
              x instanceof Date ? x.toLocaleTimeString('en-US') : x
            }
          />
          <VictoryLine data={data} />
        </VictoryChart>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={[styles.noDataText, { color: colors.textSecondary }]}>
            Not enough data to display chart.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 16,
  },
  noDataContainer: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 14,
  },
});

export default DataChart;

