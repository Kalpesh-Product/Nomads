import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Checkbox from "@mui/material/Checkbox";
import ListItemText from "@mui/material/ListItemText";

const CategorySelect = ({ options, value, onChange, error }) => {
  const selectedCategories = value ? value.split(" / ") : [];

  return (
    <TextField
      select
      label="Category"
      required
      fullWidth
      variant="standard"
      size="small"
      value={selectedCategories}
      error={error}
      helperText="Select 1 to 4 categories"
      onChange={(event) => {
        const selected =
          typeof event.target.value === "string"
            ? event.target.value.split(",")
            : event.target.value;
        if (selected.length <= 4) onChange(selected.join(" / "));
      }}
      slotProps={{
        select: {
          multiple: true,
          renderValue: (selected) => selected.join(" / "),
          MenuProps: { PaperProps: { style: { maxHeight: 360 } } },
        },
      }}
    >
      {options.map((category) => {
        const checked = selectedCategories.includes(category);
        return (
          <MenuItem
            key={category}
            value={category}
            disabled={!checked && selectedCategories.length >= 4}
          >
            <Checkbox checked={checked} />
            <ListItemText primary={category} />
          </MenuItem>
        );
      })}
    </TextField>
  );
};


export default CategorySelect;
