import CanvasRenderService, { ChartJSNodeCanvas } from 'chartjs-node-canvas';

import { writeFileSync } from "node:fs"

type Props = Parameters<typeof ChartJSNodeCanvas.prototype.renderToDataURL>[0]

interface GraphProps extends Props {
    backgroundColour?: string,
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
                grid: {
                    lineWidth: 5
                }, 
                angleLines: {
                    lineWidth: 1
                },
                pointLabels: {
                    font: {
                        size: 40,
                        weight: "bold"
                    }
                },
                beginAtZero: true,
                min: 0,
                max: 100,
                ticks: {
                    stepSize: 20
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
                max: 100
            }
        }
    },
}


export const createGraph = async ({backgroundColour="white", filename, width=1000, height=1000, ...props}: GraphProps) => {
    const canvasRenderService =  new CanvasRenderService.ChartJSNodeCanvas({ backgroundColour: backgroundColour, width: width, height: height, chartCallback: (ChartJS) => { ChartJS.defaults.font.size = 30; } });
    const dataUrl = await canvasRenderService.renderToDataURL({
        ...props
    });
    writeFileSync(`./src/assets/${filename}.png`, (dataUrl).replace(/^data:image\/png;base64,/, ""), "base64")
    return filename
}

