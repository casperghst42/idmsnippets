# Asynchronous Operations in a driver

Let this be clear; it is bad mojo to use sleep or wait in a driver policy, there are times where you cannot get around using them, but you cannot be 100% sure that something will not behave strangely.

__*Some people will probably disagree with this, that is fine, I can live with that.*__<br/>

There are other options, they will require more work, but they will not fail when the "timeout" suddenly is longer than anticipated.

The most use reason for using sleep or wait is that the driver has to wait for something to happen, that can be a depending object in a destination, or the creation of a role or resource within the system it self.

So if you set the timeout to 3 minutes (180 seconds), and then it one day take 181 seconds, what happens to your code, do you have code in place to recover (most people do not). Then the timeout sill be raised to 5 minutes (300 seconds), that will then work until that is also not enough. 

Sorry, it is a bad idea.

But then what should one then do. There is a hidden gem of a driver, actually it is not a gem, but many people forget that it exist. I am talking about the [**WorkOrder** driver. ](https://www.netiq.com/documentation/identity-manager-49-drivers/work_order/data/work-order-driver.html) 

