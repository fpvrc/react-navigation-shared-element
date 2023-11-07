import * as React from "react";
import { SharedElementProps as RawSharedElementProps } from "react-native-shared-element";
export type SharedElementProps = Omit<RawSharedElementProps, "onNode"> & {
    id: string;
};
declare class SharedElement extends React.Component<SharedElementProps> {
    private node;
    private sharedId;
    private sceneData;
    constructor(props: SharedElementProps);
    render(): React.JSX.Element;
    componentDidUpdate(): void;
    private onSetNode;
}
export default SharedElement;
//# sourceMappingURL=SharedElement.d.ts.map