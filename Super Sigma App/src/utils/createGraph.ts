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
                backgroundColor: string[],
            }[]
    },
    width?: number,
    height?: number
}

export interface BarGraphProps extends GraphProps {
    type: "bar"
    options: {
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            y: {
                beginAtZero: boolean
                max: number
            }
        }
    }
}

export const defaultBarGraphProps: Pick<BarGraphProps, "type" | "options"> = {
    type: "bar",
    options: {
        plugins: {
            legend: {   
                display: false
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5
            }
        }
    },
}

export interface LineGraphProps extends GraphProps {
    data: {
        labels: string[],
        type: "line"
        datasets:
            {
                label: string,
                data: number[],
                fill: false,
                borderColor: string
                backgroundColor: string[],
                tension: 0.1
            }[]

    }        
}

export const createGraph = async ({filename, width=1000, height=1000, ...props}: GraphProps) => {
    const canvasRenderService =  new CanvasRenderService.ChartJSNodeCanvas({ width: width, height: height, chartCallback: (ChartJS) => { ChartJS.defaults.font.size = 30; } });
    const dataUrl = await canvasRenderService.renderToDataURL({
        ...props
    });
    writeFileSync("./src/assets/"+filename+".png", (dataUrl).replace(/^data:image\/png;base64,/, ""), "base64")
    return filename
}

