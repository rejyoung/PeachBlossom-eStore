import { Grid, InputAdornment } from "@mui/material";
import React, { SetStateAction } from "react";
import { FormField } from "../../../../../common/components/Fields/FormField";
import { SelectField } from "../../../../../common/components/Fields/SelectField";
import {
    colorOptions,
    materialOptions,
} from "../../AVProductDetails/utils/avProductUtils";
import DynamicCategoryField from "./DynamicCategoryField";
import { adminFormInputStyle } from "../../../../constants/formInputStyles";
import { useAppSelector } from "../../../../hooks/reduxHooks";
import { RootState } from "../../../../store/store";

interface AddProductInfoFormProps {
    subcategories: string[] | "disabled";
    setSubcategories: React.Dispatch<SetStateAction<string[] | "disabled">>;
    categoryOptions: string[];
}
const AddProductInfoForm: React.FC<AddProductInfoFormProps> = ({
    subcategories,
    setSubcategories,
    categoryOptions,
}) => {
    const categories = useAppSelector(
        (state: RootState) => state.avMenuData.categories
    );

    return (
        <React.Fragment>
            <FormField
                label="Product Name"
                name="name"
                required={true}
                sx={adminFormInputStyle}
                inputSx={{ backgroundColor: "white" }}
            />

            <Grid
                columnSpacing={3}
                sx={{ display: "flex", flexWrap: "wrap" }}
                container
                size={12}
            >
                <Grid size={6}>
                    <FormField
                        label="Prefix"
                        name="prefix"
                        required={true}
                        pattern="^[a-zA-Z]{1,2}$"
                        sx={adminFormInputStyle}
                        inputSx={{ backgroundColor: "white" }}
                    />
                </Grid>
                <Grid size={6}>
                    <FormField
                        label="Price"
                        name="price"
                        required={true}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment
                                    position="start"
                                    sx={{
                                        backgroundColor: "white",
                                        "&.MuiInputAdornment-root": {
                                            backgroundColor: "white !important",
                                        },
                                    }}
                                    style={{
                                        backgroundColor: "white !important",
                                    }}
                                >
                                    $
                                </InputAdornment>
                            ),
                        }}
                        pattern="^\d*\.?\d{0,2}$"
                        inputMode="decimal"
                        sx={adminFormInputStyle}
                        inputSx={{
                            backgroundColor: "white !important",
                        }}
                    />
                </Grid>
            </Grid>
            <Grid
                spacing={3}
                sx={{ display: "flex", flexWrap: "wrap" }}
                container
                size={12}
            >
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                    }}
                >
                    <DynamicCategoryField
                        label="Category"
                        name="category"
                        multiple={false}
                        required={true}
                        options={categoryOptions}
                        categories={categories}
                        setSubcategories={setSubcategories}
                        sx={adminFormInputStyle}
                    />
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                    }}
                >
                    <SelectField
                        label="Subcategory"
                        name="subcategory"
                        multiple={false}
                        required={false}
                        options={subcategories}
                        sx={adminFormInputStyle}
                    />
                </Grid>
            </Grid>
            <Grid
                spacing={3}
                sx={{ display: "flex", flexWrap: "wrap" }}
                container
                size={12}
            >
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                    }}
                >
                    <SelectField
                        label="Color"
                        name="color"
                        multiple={false}
                        required={true}
                        options={colorOptions}
                        sx={adminFormInputStyle}
                    />
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                    }}
                >
                    <SelectField
                        label="Material"
                        name="material"
                        multiple={true}
                        required={true}
                        options={materialOptions}
                        sx={adminFormInputStyle}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
};
export default AddProductInfoForm;
