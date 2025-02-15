import hoistNonReactStatics from "hoist-non-react-statics";
import * as React from "react";
import { View, StyleSheet, InteractionManager } from "react-native";
import { nodeFromRef } from "react-native-shared-element";
import SharedElementSceneContext from "./SharedElementSceneContext";
import SharedElementSceneData from "./SharedElementSceneData";
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
function isValidNavigationState(state) {
    return "index" in state && "routes" in state;
}
// Gets the current screen from navigation state
function getActiveRoute(state) {
    const route = state.routes[state.index];
    const routeState = route.state;
    return route.state && isValidNavigationState(routeState)
        ? getActiveRoute(routeState) // Dive into nested navigators
        : route;
}
function isActiveRoute(navigation, route) {
    // @ts-ignore: getState is supported by navigation 6
    const state = navigation.getState
        ? // @ts-ignore: getState is supported by navigation 6
            navigation.getState()
        : // @ts-ignore: dangerouslyGetState is provided for navigation 5 compatibility
            navigation.dangerouslyGetState();
    const activeRoute = getActiveRoute(state);
    return route.key === activeRoute.key;
}
function createSharedElementScene(Component, sharedElements, rendererData, emitter, AnimationContext, navigatorId, verbose) {
    const config = {
        Component,
        sharedElements,
        rendererData,
        AnimationContext,
        navigatorId,
        verbose,
    };
    class SharedElementSceneView extends React.PureComponent {
        subscriptions = {};
        sceneData = new SharedElementSceneData(Component, () => config.sharedElements || Component.sharedElements, this.props.route, navigatorId, rendererData.nestingDepth, verbose);
        static config = config;
        componentDidMount() {
            const { navigation } = this.props;
            this.subscriptions = {
                willFocus: emitter.addListener("focus", this.onWillFocus),
                willBlur: emitter.addListener("blur", this.onWillBlur),
                transitionStart: navigation.addListener("transitionStart", this.onTransitionStart),
                transitionEnd: navigation.addListener("transitionEnd", this.onTransitionEnd),
            };
        }
        onTransitionStart = (event) => {
            const closing = event.data.closing;
            rendererData.startTransition(closing, navigatorId, rendererData.nestingDepth);
            //rendererData.updateSceneState(this.sceneData, "willFocus");
        };
        onTransitionEnd = ({ data: { closing } }) => {
            rendererData.endTransition(closing, navigatorId, rendererData.nestingDepth);
        };
        componentWillUnmount() {
            Object.values(this.subscriptions).forEach((unsubscribe) => unsubscribe());
        }
        render() {
            // console.log('SharedElementSceneView.render');
            return (React.createElement(SharedElementSceneContext.Provider, { value: this.sceneData },
                React.createElement(View, { style: styles.container, collapsable: false, ref: this.onSetRef },
                    React.createElement(AnimationContext.Consumer, null, this.onRenderAnimationContext),
                    React.createElement(Component, { ...this.props }))));
        }
        onRenderAnimationContext = (value) => {
            this.sceneData.setAnimimationContextValue(value);
            return null;
        };
        componentDidUpdate() {
            this.sceneData.updateRoute(this.props.route);
        }
        onSetRef = (ref) => {
            this.sceneData.setAncestor(nodeFromRef(ref));
        };
        onWillFocus = () => {
            const { navigation, route } = this.props;
            //console.log("onWillFocus: ", route);
            if (isActiveRoute(navigation, route)) {
                this.sceneData.updateRoute(route);
                rendererData.updateSceneState(this.sceneData, "willFocus");
                InteractionManager.runAfterInteractions(() => {
                    //console.log("onDidFocus: ", this.props.route);
                    this.sceneData.updateRoute(this.props.route);
                    rendererData.updateSceneState(this.sceneData, "didFocus");
                });
            }
        };
        onWillBlur = () => {
            const { route } = this.props;
            //console.log("onWillBlur: ", route);
            this.sceneData.updateRoute(route);
            //rendererData.updateSceneState(this.sceneData, "willBlur");
        };
    }
    hoistNonReactStatics(SharedElementSceneView, Component);
    return SharedElementSceneView;
}
export default createSharedElementScene;
//# sourceMappingURL=createSharedElementScene.js.map