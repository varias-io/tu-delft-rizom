import CanvasRenderService, { ChartJSNodeCanvas } from 'chartjs-node-canvas';

import { writeFileSync } from "node:fs"

type Props = Parameters<typeof ChartJSNodeCanvas.prototype.renderToDataURL>[0]

interface GraphProps extends Props {
    filename: string,
    width?: number,
    height?: number
}


export interface RadarGraphProps extends GraphProps {
    type: "radar"
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
    writeFileSync(`./src/assets/${filename}.png`, (dataUrl).replace(/^data:image\/png;base64,/, ""), "base64")
    return filename
}

