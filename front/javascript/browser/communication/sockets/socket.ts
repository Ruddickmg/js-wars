import single from "../../../tools/singleton";

export default single<any>((): any => {

    const local = "http://172.17.0.5:8080";
    const remote = "http://jswars-jswars.rhcloud.com:8000";

    return io.connect(remote) || io.connect(local);
});
