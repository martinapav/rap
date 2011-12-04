/*******************************************************************************
 * Copyright (c) 2011 Rüdiger Herrmann and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Rüdiger Herrmann - initial API and implementation
 *    EclipseSource - ongoing development
 ******************************************************************************/
package org.eclipse.swt.internal.widgets.tooltipkit;

import static org.eclipse.rwt.lifecycle.WidgetLCAUtil.preserveListener;
import static org.eclipse.rwt.lifecycle.WidgetLCAUtil.preserveProperty;
import static org.eclipse.rwt.lifecycle.WidgetLCAUtil.renderListener;
import static org.eclipse.rwt.lifecycle.WidgetLCAUtil.renderProperty;

import java.io.IOException;

import org.eclipse.rwt.internal.protocol.ClientObjectFactory;
import org.eclipse.rwt.internal.protocol.IClientObject;
import org.eclipse.rwt.lifecycle.*;
import org.eclipse.swt.events.SelectionEvent;
import org.eclipse.swt.graphics.Point;
import org.eclipse.swt.internal.widgets.IToolTipAdapter;
import org.eclipse.swt.widgets.ToolTip;
import org.eclipse.swt.widgets.Widget;


public final class ToolTipLCA extends AbstractWidgetLCA {

  private static final String TYPE = "rwt.widgets.ToolTip";

  private static final String PROP_AUTO_HIDE = "autoHide";
  private static final String PROP_TEXT = "text";
  private static final String PROP_MESSAGE = "message";
  private static final String PROP_LOCATION = "location";
  private static final String PROP_VISIBLE = "visible";
  private static final String PROP_SELECTION_LISTENER = "selection";

  private static final Point DEFAULT_LOCATION = new Point( 0, 0 );

  public void preserveValues( Widget widget ) {
    ToolTip toolTip = ( ToolTip )widget;
    WidgetLCAUtil.preserveCustomVariant( widget );
    WidgetLCAUtil.preserveRoundedBorder( widget );
    WidgetLCAUtil.preserveBackgroundGradient( widget );
    preserveProperty( toolTip, PROP_AUTO_HIDE, toolTip.getAutoHide() );
    preserveProperty( toolTip, PROP_TEXT, toolTip.getText() );
    preserveProperty( toolTip, PROP_MESSAGE, toolTip.getMessage() );
    preserveProperty( toolTip, PROP_LOCATION, getLocation( toolTip ) );
    preserveProperty( toolTip, PROP_VISIBLE, toolTip.isVisible() );
    preserveListener( toolTip, PROP_SELECTION_LISTENER, SelectionEvent.hasListener( toolTip ) );
  }

  public void readData( Widget widget ) {
    ToolTip toolTip = ( ToolTip )widget;
    ControlLCAUtil.processSelection( toolTip, null, false );
    readVisible( toolTip );
  }

  public void renderInitialization( Widget widget ) throws IOException {
    ToolTip toolTip = ( ToolTip )widget;
    IClientObject clientObject = ClientObjectFactory.getForWidget( toolTip );
    clientObject.create( TYPE );
    clientObject.setProperty( "parent", WidgetUtil.getId( toolTip.getParent() ) );
    clientObject.setProperty( "style", WidgetLCAUtil.getStyles( toolTip ) );
  }

  public void renderChanges( Widget widget ) throws IOException {
    ToolTip toolTip = ( ToolTip )widget;
    WidgetLCAUtil.renderCustomVariant( widget );
    WidgetLCAUtil.renderRoundedBorder( widget );
    WidgetLCAUtil.renderBackgroundGradient( widget );
    renderProperty( toolTip, PROP_AUTO_HIDE, toolTip.getAutoHide(), false );
    renderProperty( toolTip, PROP_TEXT, toolTip.getText(), "" );
    renderProperty( toolTip, PROP_MESSAGE, toolTip.getMessage(), "" );
    renderProperty( toolTip, PROP_LOCATION, getLocation( toolTip ), DEFAULT_LOCATION );
    renderProperty( toolTip, PROP_VISIBLE, toolTip.isVisible(), false );
    renderListener( toolTip,
                    PROP_SELECTION_LISTENER,
                    SelectionEvent.hasListener( toolTip ),
                    false );
  }

  public void renderDispose( Widget widget ) throws IOException {
    ClientObjectFactory.getForWidget( widget ).destroy();
  }

  private static void readVisible( ToolTip toolTip ) {
    String value = WidgetLCAUtil.readPropertyValue( toolTip, PROP_VISIBLE );
    if( value != null ) {
      toolTip.setVisible( new Boolean( value ).booleanValue() );
    }
  }

  private static Point getLocation( ToolTip toolTip ) {
    return toolTip.getAdapter( IToolTipAdapter.class ).getLocation();
  }
}
