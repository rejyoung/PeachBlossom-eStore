import React, { ComponentProps, SetStateAction } from "react";
import {
    InputLabel,
    Select,
    TextField,
    Box,
    MenuItem,
    Checkbox,
    ListItemText,
} from "@mui/material";

interface SelectFieldProps<T = string> {
    label: string;
    name: string;
    multiple: boolean;
    options: string[] | "disabled";
    required: boolean;
    sx?: ComponentProps<typeof TextField>["sx"];
    setAction?: React.Dispatch<SetStateAction<T>>;
    setMultipleAction?: React.Dispatch<SetStateAction<string[]>>;
    value: string[] | string;
    readOnly: boolean;
    variant: "filled" | "outlined" | "standard" | undefined;
    someOptionsDisabled?: boolean;
    optionsToStayEnabled?: string[];
}

const itemHeight = 48;
const itemPaddingTop = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: itemHeight * 4.5 + itemPaddingTop,
            width: 250,
        },
    },
};

// prettier-ignore
export const SelectFieldNonFormik = <T=string>({
    label,
    name,
    multiple,
    options,
    required,
    sx,
    setAction,
    setMultipleAction,
    value,
    readOnly,
    variant,
    someOptionsDisabled = false,
    optionsToStayEnabled,
}: SelectFieldProps<T>): React.JSX.Element => {
    return (
        <Box>
            <Select
                fullWidth
                labelId={`${name}-label`}
                variant={variant}
                multiple={multiple}
                id={name}
                label={label}
                disabled={options === "disabled"}
                required={required}
                renderValue={(selected) =>
                    multiple ? (selected as string[]).join(", ") : selected
                }
                sx={sx}
                MenuProps={MenuProps}
                value={value}
                onChange={(e) => {
                    if (Array.isArray(e.target.value) && setMultipleAction) {
                        setMultipleAction(e.target.value);
                    }
                    if (!Array.isArray(e.target.value) && setAction) {
                        setAction(e.target.value as T);
                    }
                }}
                inputProps={{
                    readOnly: readOnly,
                }}
            >
                {Array.isArray(options) &&
                    options.map((option: string) => (
                        <MenuItem
                            value={option}
                            key={option}
                            disabled={
                                someOptionsDisabled &&
                                optionsToStayEnabled &&
                                !optionsToStayEnabled.includes(option)
                            }
                        >
                            {multiple && (
                                <Checkbox
                                    checked={
                                        (value as string[]).indexOf(option) > -1
                                    }
                                />
                            )}
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
            </Select>
            <InputLabel
                id={`${name}=label`}
                required={required}
                sx={{ transform: "translate(12px, -52px) scale(0.75)" }}
            >
                {label}
            </InputLabel>
        </Box>
    );
};
