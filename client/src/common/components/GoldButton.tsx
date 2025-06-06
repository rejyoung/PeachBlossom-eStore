import React, { CSSProperties } from "react";

interface Props {
    onClick: () => void;
    text: string;
    id?: string;
    type?: "button" | "submit" | "reset";
    width?: string;
    height?: string;
    className?: string;
    disabled?: boolean;
    mobile?: boolean;
}

const GoldButton: React.FC<Props> = ({
    onClick,
    text,
    id,
    type,
    width,
    height,
    className,
    disabled,
    mobile,
}) => {
    const divStyle: CSSProperties = {
        width: width ? width : "100px",
        height: height ? height : "40px",
        position: "relative",
    };
    const background: CSSProperties = {
        content: "'",
        backgroundColor: "#e8b154",
        height: "100%",
        width: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        borderRadius: "5px",
        boxShadow: "0.5px 0.5px 2px 0 black",
        filter: disabled ? "saturate(0)" : undefined,
    };

    const backgroundOverlay: CSSProperties = {
        background: `radial-gradient(
            ellipse farthest-corner at right bottom,
            #b2b2b2 0%,
            #bdbdbd 8%,
            #7b7b7b 30%,
            #6f6f6f 40%,
            transparent 80%
        ),
        radial-gradient(
            ellipse farthest-corner at left top,
            #fefefe 0%,
            #ffffff 8%,
            #b4b4b4 25%,
            #4a4a4a 62.5%,
            #4a4a4a 100% /* was #5d4a1f */
        )`,
        width: "100%",
        height: "100%",
        backgroundSize: "115% 115%",
        backgroundPosition: "center",
        position: "absolute",
        top: 0,
        left: 0,
        borderRadius: "5px",
        mixBlendMode: "luminosity",
        opacity: 0.8,
    };

    const buttonStyle: CSSProperties = {
        backgroundColor: "transparent",
        border: "none",
        color: "white",
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        cursor: disabled ? undefined : "pointer",
    };

    const buttonProps = {
        type: type ? type : "button",
        ...(id && { id }),
        className: className ? "button-comp" + " " + className : "button-comp",
        // onClick: disabled ? undefined : onClick,
        style: buttonStyle,
    };

    const divProps = {
        ...(id && { id }),
        className: "button",
        style: divStyle,
    };

    const mobileDivProps = !mobile
        ? undefined
        : {
              minWidth: "40px",
              minHeight: "40px",
              width: "auto",
              height: "auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
          };

    return (
        <div style={mobileDivProps} onClick={disabled ? undefined : onClick}>
            <div {...divProps}>
                <div className="button-comp-bkg" style={background}></div>
                {!disabled && (
                    <div
                        className="button-comp-bkg-overlay"
                        style={backgroundOverlay}
                    ></div>
                )}
                <button {...buttonProps}>{text.toUpperCase()}</button>
            </div>
        </div>
    );
};
export default GoldButton;
