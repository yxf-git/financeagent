const CommonTextStyle = {
	fontSize: 14,
	color: "#94A0AF",
};

const CommonAxisStyle = {
	lineStyle: {
		color: "#6E7079"
	}
}

const sortPieChartData = (xAxis_data, series_data) => {
	let result_arr = []
	if (xAxis_data.length > 0) {
		xAxis_data.forEach((item, index) => {
			result_arr.push({
				label: item,
				value: series_data[index]
			})
		})
		result_arr.sort(function (a, b) {
			return b.value - a.value;
		})
	}

	return result_arr
}

// 1、饼图
export const chartPie = (data) => {
	let series_outer_center = data.series_outer_center || ['50%', '40%']
	let series_inside_center = data.series_inside_center || ['50%', '40%']

	let series_outer_radius = data.series_outer_radius || [0, "55%"]
	let series_inside_radius = data.series_inside_radius || [0, "55%"]
	let sort_result = sortPieChartData(data.xAxis_data, data.series_data)
	// 图例个数超过12个，取前11个，然后加一个其他
	// 图例个数小于12个，取所有的
	let other_result_arr = []
	let display_result_arr = []
	if (sort_result.length > 11) {
		display_result_arr = sort_result.slice(0, 11)
		other_result_arr = sort_result.slice(11, sort_result.length)
		let other_item = {
			label: '其他',
			value: 0
		}
		other_result_arr.forEach(item => {
			other_item.value += item.value
		})
		display_result_arr.push(other_item)
	} else {
		display_result_arr = sort_result.slice(0, 12)
	}

	const xAxis_data = display_result_arr.map(i => i.label) || [];
	const color_list = data.color_list || [];
	let legend_data = display_result_arr.map(i => i.label) || []

	let series_data = [];
	if (data.series_data && data.series_data.length > 0) {
		series_data = display_result_arr.map(i => i.value).map((item, index) => {
			let _item = {};
			_item.name = xAxis_data[index];
			_item.value = item;
			return _item;
		});
	}

	const option = {
		color: color_list,
		tooltip: {
			trigger: "item",
			formatter: function (params) {
				return params.marker + params.name + '<br />' + params.value + "（" + params.percent + "%" + "）"
			},
		},
		legend: {
			orient: 'horizontal',
			selectedMode: false,
			bottom: 0,
			icon: 'circle',
			backgroundColor: 'rgba(148, 160, 175, 0.1)',
			borderRadius: 6,
			padding: [10, 8, 6, 8],
			itemWidth: 4,
			itemHeight: 8,
			tooltip: {
				show: true
			},
			formatter: name => {
				if (name.length < 6) {
					return `{item|${name}}`
				} else {
					return `{item|${name.substr(0, 4) + '...'}}`
				}
			},
			textStyle: {
				color: "#94A0AF",
				fontSize: 12,
				rich: {
					item: {
						width: 60,
						lineHeight: 12
					}
				}
			},
			data: legend_data
		},
		series: [
			{
				// 隐藏的部分：显示外部label：名字、内部颜色
				type: "pie",
				center: series_outer_center,
				radius: series_outer_radius,
				selectedMode: 'single',
				data: series_data.map(item => {
					return {
						value: item.value,
						itemStyle: {
							opacity: 0
						},
						label: {
							show: true,
							opacity: 1,
						}
					}
				}),
				silent: true,
				label: {
					position: "outer",
					alignTo: 'labelLine',
					fontSize: 14,
					color: "#94A0AF",
					formatter: (params) => {
						return xAxis_data[params.dataIndex]
					},
				},
			},
			{
				// 实际展示的部分：显示内部label：百分数
				type: "pie",
				center: series_inside_center,
				radius: series_inside_radius,
				selectedMode: 'single',
				data: series_data,
				label: {
					position: "inside",
					fontSize: 14,
					color: "#ffffff",
					formatter: (params) => {
						let label = ""
						if (params.percent < 8) {
							label = ""
						} else {
							label = Math.floor(params.percent) + "%"
						}
						return label
					},
					textShadowColor: "rgba(148, 160, 175, 1)",
					textShadowBlur: 4
				},
				emphasis: {
					itemStyle: {
						shadowBlur: 20,
						shadowOffsetX: 0,
						shadowColor: "rgba(0, 0, 0, 0.5)",
					},
				},
			}
		],
	};
	return option;
};

// 2、柱状图
export const chartBar = (data, axisStyle = {}, grid = {}) => {
	const xAxis_data = data.xAxis_data || [];
	const color_list = data.color_list || [];
	const title = data.title || [];
	let series_data = data.series_data;
	const option = {
		color: color_list,
		barMaxWidth: 46,
		tooltip: {
			show: true
		},
		title: {
			show: true,
			text: title,
			left: 0,
			top: 15,
			textStyle: {
				color: "#6E7079",
				fontSize: 16,
				fontWeight: "normal"
			}
		},
		grid: {
			containLabel: true,
			left: 50,
			right: 12,
			top: 60,
			bottom: 10,
			...grid
		},
		label: {
			show: true,
			position: 'top',
			color: "#94A0AF",
			fontSize: 14,
		},
		xAxis: {
			type: 'category',
			data: xAxis_data,
			axisLabel: {
				...CommonTextStyle, ...axisStyle,
				formatter: (value) => {
					if (value.length > 6) {
						return value.substring(0, 6) + "..."
					} else {
						return value
					}
				}
			},
			axisLine: {
				...CommonAxisStyle
			},
			axisTick: {
				...CommonAxisStyle
			}
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				...CommonTextStyle
			}
		},
		series: [{
			data: series_data,
			type: 'bar',
			itemStyle: {
				borderRadius: [5, 5, 0, 0],
				color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
					{ offset: 0, color: '#74B0FF' },
					{ offset: 1, color: '#3185F5' }
				])
			}
		}]
	};
	return option;
};

import * as echarts from "echarts";
// 3、通用柱状图
export const histogram = (data, customerOptions = {}) => {
	const xAxis_data = data.xAxis_data || [];
	const color_list = data.color_list || [];
	const title = data.title || [];
	let series_data = data.series_data;
	const option = {
		color: color_list,
		barMaxWidth: 46,
		tooltip: {
			show: true
		},
		title: {
			show: true,
			text: title,
			left: 0,
			top: 15,
			textStyle: {
				color: "#6E7079",
				fontSize: 16,
				fontWeight: "normal"
			}
		},
		grid: {
			containLabel: true,
			left: 0,
			right: 0,
			top: 60,
			bottom: 10
		},
		label: {
			show: true,
			position: 'top',
			color: "#94A0AF",
			fontSize: 14,
		},
		xAxis: {
			type: 'category',
			data: xAxis_data,
			axisLabel: {
				...CommonTextStyle,
			},
			axisLine: {
				...CommonAxisStyle
			},
			axisTick: {
				...CommonAxisStyle
			}
		},
		yAxis: {
			type: 'value',
			axisLabel: {
				...CommonTextStyle
			}
		},
		series: [{
			data: series_data,
			type: 'bar'
		}]
	};
	const mergedOption = echarts.util.merge(option, customerOptions);
	return mergedOption;
};

// 4、饼图 - 好中差评占比
export const chartPie_ratingLevelProportion = (data) => {
	let sort_result = sortPieChartData(data.xAxis_data, data.series_data)
	// 图例个数超过12个，取前11个，然后加一个其他
	// 图例个数小于12个，取所有的
	let other_result_arr = []
	let display_result_arr = []
	if (sort_result.length > 11) {
		display_result_arr = sort_result.slice(0, 11)
		other_result_arr = sort_result.slice(11, sort_result.length)
		let other_item = {
			label: '其他',
			value: 0
		}
		other_result_arr.forEach(item => {
			other_item.value += item.value
		})
		display_result_arr.push(other_item)
	} else {
		display_result_arr = sort_result.slice(0, 12)
	}

	const xAxis_data = display_result_arr.map(i => i.label) || [];
	const color_list = data.color_list || [];
	let legend_data = display_result_arr.map(i => i.label) || []

	let series_data = [];
	if (data.series_data && data.series_data.length > 0) {
		series_data = display_result_arr.map(i => i.value).map((item, index) => {
			let _item = {};
			_item.name = xAxis_data[index];
			_item.value = item;
			return _item;
		});
	}

	const option = {
		color: color_list,
		tooltip: {
			trigger: "item",
			formatter: function (params) {
				return params.marker + params.name + '<br />' + params.value + "（" + params.percent + "%" + "）"
			},
		},
		legend: {
			orient: 'horizontal',
			selectedMode: false,
			bottom: 0,
			icon: 'circle',
			backgroundColor: 'rgba(148, 160, 175, 0.1)',
			borderRadius: 6,
			padding: [10, 8, 6, 8],
			itemWidth: 8,
			itemHeight: 8,
			tooltip: {
				show: true
			},
			formatter: name => {
				if (name.length < 6) {
					return `{item|${name}}`
				} else {
					return `{item|${name.substr(0, 4) + '...'}}`
				}
			},
			textStyle: {
				color: "#94A0AF",
				fontSize: 12,
				rich: {
					item: {
						width: 60,
						lineHeight: 12
					}
				}
			},
			data: legend_data
		},
		series: [
			{
				// 隐藏的部分：显示外部label：名字、内部颜色
				type: "pie",
				center: ['50%', '50%'],
				radius: [0, "61%"],
				selectedMode: 'single',
				data: series_data.map(item => {
					return {
						value: item.value,
						itemStyle: {
							opacity: 0
						},
						label: {
							show: true,
							opacity: 1,
						}
					}
				}),
				silent: true,
				label: {
					position: "outer",
					alignTo: 'labelLine',
					fontSize: 14,
					color: "#94A0AF",
					formatter: (params) => {
						return xAxis_data[params.dataIndex]
					},
				},
			},
			{
				// 实际展示的部分：显示内部label：百分数
				type: "pie",
				center: ['50%', '50%'],
				radius: [0, "61%"],
				selectedMode: 'single',
				data: series_data,
				label: {
					position: "inside",
					fontSize: 14,
					color: "#ffffff",
					formatter: (params) => {
						let label = ""
						if (params.percent < 8) {
							label = ""
						} else {
							label = Math.floor(params.percent) + "%"
						}
						return label
					},
					textShadowColor: "rgba(148, 160, 175, 1)",
					textShadowBlur: 4
				},
				emphasis: {
					itemStyle: {
						shadowBlur: 20,
						shadowOffsetX: 0,
						shadowColor: "rgba(0, 0, 0, 0.5)",
					},
				},
			}
		],
	};
	return option;
};
