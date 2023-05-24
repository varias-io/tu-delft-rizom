import CanvasRenderService from 'chartjs-node-canvas';

import { writeFileSync } from "node:fs"

const width = 1000;   // define width and height of canvas 
const height = 1000;   
const canvasRenderService = new CanvasRenderService.ChartJSNodeCanvas({
    width,
    height
});

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
    }
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

export const createGraph = async ({filename, type, data}: GraphProps) => {
    const dataUrl = await canvasRenderService.renderToDataURL({
        type: (type as any), 
        data: data
    });
    writeFileSync("./src/assets/"+filename+".png", (dataUrl).replace(/^data:image\/png;base64,/, ""), "base64")
    return filename
}

