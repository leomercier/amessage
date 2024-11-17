# Tesla RoboTaxi Booking Example (WIP)

> Improvement in privacy needed

## Scenario

Customer requests a Tesla robo taxi for immediate pickup, specifying route and preferences.

## 1. Customer Ride Request

```json
{
  "version": "0.1.0",
  "type": "aMessage",
  "timestamp": "1700287341",
  "sender": "RIDER456...xyz",
  "recipients": ["TSLABOT789...abc"],
  "messageType": "request",
  "messageId": "ride_78901",
  "content": {
    "action": "BOOK_RIDE",
    "parameters": {
      "pickup": {
        "location": {
          "latitude": 37.7858,
          "longitude": -122.4064,
          "address": "345 California St, San Francisco, CA"
        },
        "time": "immediate"
      },
      "dropoff": {
        "location": {
          "latitude": 37.4419,
          "longitude": -122.1649,
          "address": "3000 El Camino Real, Palo Alto, CA"
        }
      },
      "preferences": {
        "vehicle_type": "any", // Model 3, Y, or S
        "max_passengers": 2,
        "climate_temp": 72,
        "music": "classical",
        "route_preference": "fastest"
      }
    },
    "compensation": {
      "amount": "market",
      "terms": "dynamic:distance:demand"
    }
  }
}
```

## 2. RoboTaxi Price Quote & Vehicle Assignment

```json
{
  "version": "0.1.0",
  "type": "aMessage",
  "timestamp": "1700287342",
  "sender": "TSLABOT789...abc",
  "recipients": ["RIDER456...xyz"],
  "messageType": "response",
  "referenceId": "ride_78901",
  "content": {
    "action": "RIDE_QUOTE",
    "status": "vehicle_available",
    "vehicle": {
      "id": "TSLA_Y_2024_123",
      "model": "Model Y",
      "color": "white",
      "license": "AUT0123",
      "current_location": {
        "latitude": 37.7862,
        "longitude": -122.407
      },
      "eta_pickup": "3 minutes"
    },
    "route": {
      "distance": "33.5 miles",
      "estimated_time": "42 minutes",
      "suggested_route": [
        { "lat": 37.7858, "lon": -122.4064 },
        { "lat": 37.7831, "lon": -122.4039 },
        { "lat": 37.4419, "lon": -122.1649 }
      ]
    },
    "payment": {
      "amount": 0.15,
      "breakdown": {
        "base_fare": 0.08,
        "distance": 0.05,
        "demand_multiplier": 1.2
      },
      "address": "TSLABOT789...abc",
      "memo": "ride_78901_initial",
      "validUntil": "1700287402" // 60 seconds
    }
  }
}
```

## 3. Customer Payment & Confirmation

```json
{
  "type": "solana_transaction",
  "from": "RIDER456...xyz",
  "to": "TSLABOT789...abc",
  "amount": 0.15,
  "memo": "ride_78901_initial"
}
```

## 4. RoboTaxi Pickup Confirmation

```json
{
  "version": "0.1.0",
  "type": "aMessage",
  "timestamp": "1700287345",
  "sender": "TSLABOT789...abc",
  "recipients": ["RIDER456...xyz"],
  "messageType": "update",
  "referenceId": "ride_78901",
  "content": {
    "action": "RIDE_CONFIRMED",
    "status": "en_route_to_pickup",
    "vehicle_updates": {
      "current_location": {
        "latitude": 37.786,
        "longitude": -122.4068
      },
      "eta": "2 minutes",
      "approach_instructions": "Vehicle will stop at building entrance",
      "identifier": {
        "vehicle_lights": "will flash upon arrival",
        "verify_code": "7890"
      }
    },
    "boarding": {
      "instructions": "Approach vehicle, press door handle to open",
      "verification": "Enter code 7890 on vehicle display",
      "luggage": "Trunk will auto-open for storage"
    }
  }
}
```

## 5. Ride Progress Updates

```json
{
  "version": "0.1.0",
  "type": "aMessage",
  "timestamp": "1700287400",
  "sender": "TSLABOT789...abc",
  "recipients": ["RIDER456...xyz"],
  "messageType": "update",
  "referenceId": "ride_78901",
  "content": {
    "action": "RIDE_STATUS",
    "status": "in_progress",
    "progress": {
      "location": {
        "latitude": 37.5122,
        "longitude": -122.2013
      },
      "completed": "45%",
      "eta_destination": "23 minutes",
      "current_speed": "65 mph",
      "route_status": "optimal",
      "next_turn": "Continue on US-101 S"
    },
    "vehicle_status": {
      "battery": "82%",
      "climate": "72°F",
      "music": "Mozart Symphony No. 40"
    }
  }
}
```

## 6. Ride Completion & Payment

```json
{
  "version": "0.1.0",
  "type": "aMessage",
  "timestamp": "1700287900",
  "sender": "TSLABOT789...abc",
  "recipients": ["RIDER456...xyz"],
  "messageType": "completion",
  "referenceId": "ride_78901",
  "content": {
    "action": "RIDE_COMPLETE",
    "final_status": {
      "dropoff_location": {
        "latitude": 37.4419,
        "longitude": -122.1649
      },
      "ride_metrics": {
        "distance": "33.5 miles",
        "duration": "43 minutes",
        "route_efficiency": "98%"
      },
      "final_payment": {
        "amount": 0.15,
        "status": "completed",
        "transaction_id": "SOL_tx_789012"
      }
    }
  }
}
```

## 7. Customer Rating (Optional)

```json
{
  "version": "0.1.0",
  "type": "aMessage",
  "timestamp": "1700287910",
  "sender": "RIDER456...xyz",
  "recipients": ["TSLABOT789...abc"],
  "messageType": "feedback",
  "referenceId": "ride_78901",
  "content": {
    "action": "RATE_RIDE",
    "rating": 5,
    "categories": {
      "vehicle_cleanliness": 5,
      "ride_comfort": 5,
      "navigation_efficiency": 5
    },
    "feedback": "Smooth ride and perfect temperature!"
  }
}
```

## Key Features Demonstrated

1. **Autonomous Vehicle Integration**

   - Real-time vehicle tracking
   - Automated pickup protocol
   - Smart routing
   - Climate and comfort controls

2. **Dynamic Pricing**

   - Distance-based calculation
   - Demand multiplier
   - Transparent breakdown
   - SOL payment integration

3. **Safety & Verification**

   - Unique ride codes
   - Vehicle identification
   - Location tracking
   - Status updates

4. **Rider Experience**
   - Preference settings
   - Progress updates
   - Climate control
   - Entertainment options

## Protocol Benefits

1. **Automation**

   - Fully autonomous booking
   - Smart vehicle assignment
   - Automated payments
   - Real-time adjustments

2. **Transparency**

   - Clear pricing
   - Location tracking
   - Route optimization
   - Vehicle status

3. **Security**
   - Verified transactions
   - Ride codes
   - Location monitoring
   - Payment protection
