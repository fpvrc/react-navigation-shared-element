import * as React from "react";
import SharedElementRendererData from "./SharedElementRendererData";
type PropsType = {
    rendererData: SharedElementRendererData;
};
export default class SharedElementRendererView extends React.PureComponent<PropsType> {
    private subscription?;
    componentDidMount(): void;
    componentWillUnmount(): void;
    render(): React.JSX.Element;
}
export {};
//# sourceMappingURL=SharedElementRendererView.d.ts.map