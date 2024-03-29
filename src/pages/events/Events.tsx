import { useLoaderData, useNavigate } from "react-router-dom";
import styles from "./events.module.css";
import {
    Grid,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import { deleteEvent } from "../../api/api";
import { CreateEventModal } from "./components/CreateEventModal";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";

export const Events = () => {
    const navigate = useNavigate();
    const events = useLoaderData() as Event[];
    const authenticatedUser = useSelector((state: RootState) => state.user);
    const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
    const [selectedEventId, setSelectedEventId] = useState(0);

    const handleConfirmDelete = async (id: number) => {
        setSelectedEventId(id);
        setShowConfirmationDialog(true);
    };
    const handleDeleteEvent = async () => {
        try {
            await deleteEvent(selectedEventId);
            setShowConfirmationDialog(false);
            navigate(0);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Grid container spacing={1} direction={"row"} alignItems={"center"} justifyContent={"center"}>
            <ConfirmationDialog
                open={showConfirmationDialog}
                onClose={() => setShowConfirmationDialog(false)}
                onConfirm={() => handleDeleteEvent()}
            />
            <Grid item xs={"auto"}>
                <h1 className={styles.title}>Events</h1>
                <EventsTable
                    events={events}
                    navigate={navigate}
                    handleConfirmDelete={handleConfirmDelete}
                    authenticatedUser={authenticatedUser}
                />
            </Grid>
            <Grid item></Grid>
            <Grid item>
                <CreateEventModal />
            </Grid>
        </Grid>
    );
};
function EventsTable({
    events,
    navigate,
    handleConfirmDelete,
    authenticatedUser,
}: {
    events: any;
    navigate: any;
    handleConfirmDelete: any;
    authenticatedUser: Partial<User> | null;
}) {
    const [orderDirection, setOrderDirection] = useState<"asc" | "desc">("asc");
    const [valueToOrderBy, setValueToOrderBy] = useState<string>("name");

    const handleRequestSort = (property: string) => {
        const isAscending = valueToOrderBy === property && orderDirection === "asc";
        setValueToOrderBy(property);
        setOrderDirection(isAscending ? "desc" : "asc");
    };

    const sortedEvents = [...events].sort((a, b) => {
        if (a[valueToOrderBy] < b[valueToOrderBy]) {
            return orderDirection === "asc" ? -1 : 1;
        }
        if (a[valueToOrderBy] > b[valueToOrderBy]) {
            return orderDirection === "asc" ? 1 : -1;
        }
        return 0;
    });
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <TableSortLabel
                                active={valueToOrderBy === "name"}
                                direction={valueToOrderBy === "name" ? orderDirection : "asc"}
                                onClick={() => handleRequestSort("name")}
                            >
                                Name
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={valueToOrderBy === "start_date"}
                                direction={valueToOrderBy === "start_date" ? orderDirection : "asc"}
                                onClick={() => handleRequestSort("start_date")}
                            >
                                Start Date
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={valueToOrderBy === "end_date"}
                                direction={valueToOrderBy === "end_date" ? orderDirection : "asc"}
                                onClick={() => handleRequestSort("end_date")}
                            >
                                End Date
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={valueToOrderBy === "creator"}
                                direction={valueToOrderBy === "creator" ? orderDirection : "asc"}
                                onClick={() => handleRequestSort("creator")}
                            >
                                Creator
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={valueToOrderBy === "team_event"}
                                direction={valueToOrderBy === "team_event" ? orderDirection : "asc"}
                                onClick={() => handleRequestSort("team_event")}
                            >
                                Team Event?
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>Delete event</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedEvents.map((event) => {
                        const startDateFormatted = new Date(event.start_date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        });
                        const endDateFormatted = new Date(event.end_date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        });
                        return (
                            <TableRow
                                key={event.id}
                                hover
                                onClick={() => navigate(`/dashboard/events/${event.id}`, { state: { event: event } })}
                                style={{ cursor: "pointer" }}
                            >
                                <TableCell>{event.name}</TableCell>
                                <TableCell>{startDateFormatted}</TableCell>
                                <TableCell>{endDateFormatted}</TableCell>
                                <TableCell>{event.creator?.username}</TableCell>
                                <TableCell>{event.team_event ? "Yes" : "No"}</TableCell>
                                <TableCell>
                                    {authenticatedUser?.id === event.creator?.id && (
                                        <IconButton
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleConfirmDelete(event.id);
                                            }}
                                            aria-label="delete"
                                            size="large"
                                        >
                                            <DeleteIcon style={{ color: "red" }} />
                                        </IconButton>
                                    )}
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
