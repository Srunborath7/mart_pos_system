import { StyleSheet } from "@react-pdf/renderer";

const brandReportStyles = StyleSheet.create({
  page: {
    padding: 30,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica"
  },

  logo: {
    width: 70,
    height: 70,
    marginBottom: 10,
    alignSelf: "center"
  },

  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 3,
    color: "#222"
  },

  subHeader: {
    fontSize: 12,
    textAlign: "center",
    color: "#777",
    marginBottom: 18
  },

  table: {
    display: "flex",
    flexDirection: "column",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden"
  },

  tableRow: {
    flexDirection: "row"
  },

  tableHeader: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f2f2f2",
    borderRightWidth: 1,
    borderColor: "#ddd"
  },

  tableHeaderLast: {
    borderRightWidth: 0
  },

  tableCell: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    fontSize: 9,
    textAlign: "center",
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },

  tableCellLast: {
    borderRightWidth: 0
  },

  rowEven: {
    backgroundColor: "#fafafa"
  },

  footer: {
    marginTop: 20,
    fontSize: 10,
    textAlign: "center",
    color: "#999"
  }
});

export default brandReportStyles;
