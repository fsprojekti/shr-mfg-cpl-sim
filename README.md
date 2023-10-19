# shr-mfg-cpl-sim

## Consumer

### Properties

### Functions
* rentService

```mermaid
graph TD
    S1(["rentService"])
    S2{{"service in state ACTIVE?"}}
    S3{{"service in state MARKET?"}}
    S4["get or create new service"]
    S5["create new offer direct"]
    S6["send offer direct"]
    
    S1 --> S2
    S2 -->|NO| S3
    S2 -->|YES| R1(["reject"])
    S3 -->|YES| R2(["reject"])
    S3-->|NO| S4
    S4-->S5
    S5-->S6
    S6-->E1(["end"])

```
* clcOfferPrice
* clcOfferDuration
* clcOfferProvider

### Events

```mermaid
graph TD
    E1((("offer direct expired")))
    E2((("offer direct accepted")))
    E3((("offer direct rejected")))
    E4((("offer direct send")))
    S1(("service commenced"))
    S2(("service completed"))
    
```











## Service

### States
```mermaid
graph 
    A[[IDLE]]
    B[[MARKET]]
    D[[ACTIVE]]
    E[[DONE]]

    AA["serviceService.create(consumer)"] --> A
    A --> T1["serviceService.market(service)"] --> B
    T3((("offer direct <br>accepted"))) --> C["serviceService.commence(service)"] 
    C-->T6((service<br>commenced))-->D
    D --> T4{{"&#128336 is completed?"}} --> E
    E-->T5(("service <br>completed"))

    T7((("offer direct <br>rejected")))-->T11[[OFFER_REJECTED]]-->T1
    T8((("offer direct <br>expired")))-->T12[[OFFER_EXPIRED]]-->T1
    

    
```

## Offer direct

### States
```mermaid
graph
    A0(("create"))-->|"serviceOfferDirect.create(service)"|A
    A[[IDLE]]
    B[[MARKET]]
    C[[EXPIRED]]
    D[[ACCEPTED]]
    E[[REJECTED]]
    
    A -->|"serviceOfferDirect.send(offer)"| B
    B-->|"serviceOfferDirect.expire(offer)"|C
    B-->|"serviceOfferDirect.accept(offer)"|D
    B-->|"serviceOfferDirect.reject(offer)"|E
    C --> T4(("offer direct </br> expired"))
    D-->T7((offer direct<br>accepted))
    E-->T8((offer direct<br>rejected))
    
    

```



