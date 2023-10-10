# shr-mfg-cpl-sim

## Consumer

```mermaid
graph LR
    %%E1((("service <br>commenced")))
    E2((("service <br>completed")))
    E3(((offer direct<br>accepted)))
    E4(((offer direct<br>rejected)))
    E5((("offer direct <br>expired")))
    
    E3-->T[fw]
    
    
```

## Service

### States
```mermaid
graph 
    A[[IDLE]]
    B[[MARKET]]
    D[[ACTIVE]]
    E[[DONE]]

    AA{{"serviceService.create()"}} --> A
    A --> T1{{"serviceService.market(service)"}} --> B
    T3((("offer direct <br>accepted"))) --> C{{"serviceService.commence(service)"}} 
    C-->T6((service<br>commenced))-->D
    D --> T4{{"&#128336 is completed?"}} --> E
    E-->T5(("service <br>completed")) 
   
    
```

## Offer direct

### States
```mermaid
graph 
    A[[IDLE]]
    B[[MARKET]]
    C[[EXPIRED]]
    D[[ACCEPTED]]
    E[[REJECTED]]
    
    AA{{"serviceOfferDirect.create(service)"}} --> A 
    A --> T1{{"serviceOfferDirect.send(offer)"}} --> B
    B --> T2{{"&#128336 is expired?"}} --> C 
    C --> T4(("offer direct </br> expired"))
    B --> T5{{"serviceOfferDirect.accept(offer)"}} --> D
    B --> T6{{"serviceOfferDirect.reject(offer)"}} --> E
    D-->T7((offer direct<br>accepted))
    E-->T8((offer direct<br>rejected))
```


