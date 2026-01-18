
import { MonitorDetailsView } from "../../../components/monitors/monitor-details-view"

export default async function MonitorPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    return <MonitorDetailsView id={params.id} />
}
