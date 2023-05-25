import CanvasRenderService from 'chartjs-node-canvas';

import { writeFileSync } from "node:fs"

interface GraphProps {
    filename: string,
    type: string,
    data: {
        labels: string[],
        datasets:
            {
                label: string,
                data: number[],
                backgroundColor: string,
            }[]
    },
    width?: number,
    height?: number
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
interface BarGraphProps extends GraphProps {}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
interface LineGraphProps extends GraphProps {
    data: {
        labels: string[],
        datasets:
            {
                label: string,
                data: number[],
                fill: false,
                borderColor: string
                backgroundColor: string,
                tension: 0.1
            }[]

    }        
}

export const createGraph = async ({filename, type, data, width=1000, height=1000}: GraphProps) => {
    const canvasRenderService =  new CanvasRenderService.ChartJSNodeCanvas({ width: width, height: height,});
    const dataUrl = await canvasRenderService.renderToDataURL({
        type: (type as any), 
        data: data
    });
    writeFileSync("./src/assets/"+filename+".png", (dataUrl).replace(/^data:image\/png;base64,/, ""), "base64")
    return filename
}

