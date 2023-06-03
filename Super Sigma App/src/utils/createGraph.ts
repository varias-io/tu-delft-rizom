import CanvasRenderService from 'chartjs-node-canvas';

import { writeFileSync } from "node:fs"

interface GraphProps {
    filename: string,
    type: "bar" | "line" | "scatter" | "bubble" | "pie" | "doughnut" | "polarArea" | "radar",
    data: {
        labels: string[],
        datasets:
            {
                label?: string,
                data: number[],
                backgroundColor: string,
            }[]
    },
    width?: number,
    height?: number
}

export interface RadarGraphProps extends GraphProps {
    type: "radar"
    data: {
        labels: string[],
        datasets:{
            label?: string,
            data: number[],
            backgroundColor: string,              
            borderWidth: number,
            borderColor: string,
            pointBorderWidth: number,
            pointBackgroundColor: string,
            pointBorderColor: string,
        }[]
    }
    options: {
        plugins: {
            legend: {
                display: boolean
            }
        },
        scales: {
            r: {
                pointLabels: {
                    font: {
                        size: number
                    }
                }
                beginAtZero: boolean,
                min: number,
                max: number
                ticks: {
                    stepSize: number
                }
            }
        }
    }
}

export const defaultRadarGraphProps: Pick<RadarGraphProps, "type" | "options"> = {
    type: "radar",
    options: {
        plugins: {
            legend: {   
                display: false
            },
        },
        scales: {
            r: {
                pointLabels: {
                    font: {
                        size: 30
                    }
                },
                beginAtZero: true,
                min: 0,
                max: 5,
                ticks: {
                    stepSize: 1
                }
            }
        }
    },
}

export interface LineGraphProps extends GraphProps {
    type: "line"
    data: {
        labels: string[],
        datasets:
            {
                label: string,
                data: number[],
                fill?: false,
                borderColor: string
                backgroundColor: string,
                tension?: 0.1
                borderDash?: number[]
                borderWidth?: 7
            }[]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: boolean
                    max: number
                }
            }
        }
    }        

    export const defaultLineGraphsProps: Pick<LineGraphProps, "type" | "options"> = {
        type: "line",
        options: {
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5
                }
            }
        },
    }


export const createGraph = async ({filename, width=1000, height=1000, ...props}: GraphProps) => {
    const canvasRenderService =  new CanvasRenderService.ChartJSNodeCanvas({ width: width, height: height, chartCallback: (ChartJS) => { ChartJS.defaults.font.size = 30; } });
    const dataUrl = await canvasRenderService.renderToDataURL({
        ...props
    });
    writeFileSync("./src/assets/"+filename+".png", (dataUrl).replace(/^data:image\/png;base64,/, ""), "base64")
    return filename
}

